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

const SCRIPT_DIR = path.resolve(process.cwd(), 'lib/clipify/scripts')
const TEMP_DIR = path.resolve(process.cwd(), 'tmp/clipify')

const REQUIRED_SCRIPTS = ['analyze.py', 'build_pan.py', 'build_ass.py']

export function checkClipifyAvailable(): { available: boolean; missing: string[] } {
  const missing = REQUIRED_SCRIPTS.filter(
    (s) => !fs.existsSync(path.join(SCRIPT_DIR, s))
  )
  return { available: missing.length === 0, missing }
}

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }
}

function getPython(): string {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH
  return process.platform === 'win32' ? 'python' : 'python3'
}

export class ClipifyEngine {
  constructor() {
    ensureTempDir()
  }

  async analyzeSpeakerMotion(videoPath: string, leftROI: string, rightROI: string): Promise<unknown> {
    this.assertAvailable()
    ensureTempDir()

    const lFile = path.join(TEMP_DIR, 'L.txt')
    const rFile = path.join(TEMP_DIR, 'R.txt')

    const ffmpegCmd = [
      'ffmpeg -y',
      `-i "${videoPath}"`,
      `-filter_complex "[0:v]split=2[a][b];`,
      `[a]crop=${leftROI},format=gray,tblend=all_mode=difference,signalstats,`,
      `metadata=mode=print:key=lavfi.signalstats.YAVG:file='${lFile.replace(/\\/g, '/')}'[la];`,
      `[b]crop=${rightROI},format=gray,tblend=all_mode=difference,signalstats,`,
      `metadata=mode=print:key=lavfi.signalstats.YAVG:file='${rFile.replace(/\\/g, '/')}'[ra]"`,
      `-map "[la]" -f null - -map "[ra]" -f null -`,
    ].join(' ')

    await execAsync(ffmpegCmd)

    const analyzePy = path.join(SCRIPT_DIR, 'analyze.py')
    const { stdout } = await execAsync(`${getPython()} "${analyzePy}" "${lFile}" "${rFile}" 1.0`)
    return JSON.parse(stdout)
  }

  async buildPanExpression(segmentsJson: string, leftX: number, rightX: number): Promise<string> {
    this.assertAvailable()
    ensureTempDir()

    const segmentsFile = path.join(TEMP_DIR, 'segments.json')
    fs.writeFileSync(segmentsFile, segmentsJson)

    const buildPanPy = path.join(SCRIPT_DIR, 'build_pan.py')
    const { stdout } = await execAsync(`${getPython()} "${buildPanPy}" "${segmentsFile}" ${leftX} ${rightX}`)
    return stdout.trim()
  }

  async buildAssSubtitles(
    whisperJson: string,
    style: 'opus' | 'karaoke' | 'minimal' = 'opus'
  ): Promise<string> {
    this.assertAvailable()
    ensureTempDir()

    const jsonFile = path.join(TEMP_DIR, 'whisper.json')
    const assFile = path.join(TEMP_DIR, 'captions.ass')
    fs.writeFileSync(jsonFile, whisperJson)

    const buildAssPy = path.join(SCRIPT_DIR, 'build_ass.py')
    await execAsync(`${getPython()} "${buildAssPy}" "${jsonFile}" "${assFile}" ${style}`)
    return fs.readFileSync(assFile, 'utf-8')
  }

  private assertAvailable() {
    const { available, missing } = checkClipifyAvailable()
    if (!available) {
      throw new Error(
        `Clipify Python scripts not found: ${missing.join(', ')}. ` +
          `Expected in: ${SCRIPT_DIR}`
      )
    }
  }
}

export const clipifyEngine = new ClipifyEngine()
