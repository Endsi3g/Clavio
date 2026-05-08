import { spawn } from 'child_process'
import path from 'path'

const PYTHON_PATH = path.join(process.cwd(), 'lib', 'python_env', 'Scripts', 'python.exe')
const SCRIPTS_DIR = path.join(process.cwd(), 'lib', 'python')

export async function runScrapeGraph(url: string, prompt: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'run_scrapegraph.py')
    const pythonProcess = spawn(PYTHON_PATH, [scriptPath, url, prompt])

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout)
        if (result.error) {
          reject(new Error(result.error))
        } else {
          resolve(result)
        }
      } catch (e) {
        reject(new Error(`Failed to parse python output: ${stdout}`))
      }
    })
  })
}

export async function runHermes(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'run_hermes.py')
    const pythonProcess = spawn(PYTHON_PATH, [scriptPath, query])

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout)
        if (result.error) {
          reject(new Error(result.error))
        } else {
          resolve(result)
        }
      } catch (e) {
        reject(new Error(`Failed to parse python output: ${stdout}`))
      }
    })
  })
}
