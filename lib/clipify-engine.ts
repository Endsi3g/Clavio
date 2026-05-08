import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export interface ClipSegment {
  start: number
  end: number
  why_funny: string
  suggested_title: string
}

export class ClipifyEngine {
  private scriptDir: string
  private tempDir: string

  constructor() {
    this.scriptDir = path.resolve(process.cwd(), 'lib/clipify/scripts')
    this.tempDir = path.resolve(process.cwd(), 'tmp/clipify')
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  /**
   * Analyze speaker motion in a clip to determine who is talking.
   */
  async analyzeSpeakerMotion(videoPath: string, leftROI: string, rightROI: string): Promise<any> {
    const lFile = path.join(this.tempDir, 'L.txt')
    const rFile = path.join(this.tempDir, 'R.txt')

    // FFmpeg motion analysis
    const ffmpegCmd = `ffmpeg -y -i "${videoPath}" -filter_complex "[0:v]split=2[a][b]; [a]crop=${leftROI},format=gray,tblend=all_mode=difference,signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG:file='${lFile.replace(/\\/g, '/')}'[la]; [b]crop=${rightROI},format=gray,tblend=all_mode=difference,signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG:file='${rFile.replace(/\\/g, '/')}'[ra]" -map "[la]" -f null - -map "[ra]" -f null -`
    
    await execAsync(ffmpegCmd)

    // Run Python analyze script
    const analyzePy = path.join(this.scriptDir, 'analyze.py')
    const { stdout } = await execAsync(`python "${analyzePy}" "${lFile}" "${rFile}" 1.0`)
    
    return JSON.parse(stdout)
  }

  /**
   * Generate an FFmpeg crop expression for panning between speakers.
   */
  async buildPanExpression(segmentsJson: string, leftX: number, rightX: number): Promise<string> {
    const segmentsFile = path.join(this.tempDir, 'segments.json')
    fs.writeFileSync(segmentsFile, segmentsJson)

    const buildPanPy = path.join(this.scriptDir, 'build_pan.py')
    const { stdout } = await execAsync(`python "${buildPanPy}" "${segmentsFile}" ${leftX} ${rightX}`)
    
    return stdout.trim()
  }

  /**
   * Generate ASS subtitles for a clip.
   */
  async buildAssSubtitles(whisperJson: string, style: 'opus' | 'karaoke' | 'minimal' = 'opus'): Promise<string> {
    const jsonFile = path.join(this.tempDir, 'whisper.json')
    const assFile = path.join(this.tempDir, 'captions.ass')
    fs.writeFileSync(jsonFile, whisperJson)

    const buildAssPy = path.join(this.scriptDir, 'build_ass.py')
    await execAsync(`python "${buildAssPy}" "${jsonFile}" "${assFile}" ${style}`)
    
    return fs.readFileSync(assFile, 'utf-8')
  }
}

export const clipifyEngine = new ClipifyEngine()
