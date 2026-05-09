import { spawn } from 'child_process'
import path from 'path'

function getPythonExecutable(): string {
  const envPath = process.env.PYTHON_PATH
  if (envPath) return envPath

  // Check for a local venv (cross-platform)
  const isWindows = process.platform === 'win32'
  const venvBin = isWindows ? 'Scripts' : 'bin'
  const pythonBin = isWindows ? 'python.exe' : 'python3'

  // Prefer local virtualenv, fall back to system python3/python
  const localVenv = path.join(process.cwd(), 'lib', 'python_env', venvBin, pythonBin)
  return localVenv
}

function getPythonFallback(): string {
  return process.platform === 'win32' ? 'python' : 'python3'
}

const SCRIPTS_DIR = path.join(process.cwd(), 'lib', 'python')

async function runPythonScript(scriptName: string, args: string[]): Promise<unknown> {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName)
  const pythonExe = getPythonExecutable()

  return new Promise((resolve, reject) => {
    let process_ = spawn(pythonExe, [scriptPath, ...args])

    // If the local venv doesn't exist, fall back to system python
    process_.on('error', () => {
      const fallback = getPythonFallback()
      if (fallback === pythonExe) {
        reject(new Error(`Python not found. Set PYTHON_PATH env var or create a venv at lib/python_env.`))
        return
      }
      process_ = spawn(fallback, [scriptPath, ...args])
      bindEvents(process_, resolve, reject)
    })

    bindEvents(process_, resolve, reject)
  })
}

function bindEvents(
  proc: ReturnType<typeof spawn>,
  resolve: (v: unknown) => void,
  reject: (e: Error) => void
) {
  let stdout = ''
  let stderr = ''

  proc.stdout?.on('data', (data) => { stdout += data.toString() })
  proc.stderr?.on('data', (data) => { stderr += data.toString() })

  proc.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Python process exited with code ${code}. Stderr: ${stderr}`))
      return
    }
    try {
      const result = JSON.parse(stdout)
      if (result.error) {
        reject(new Error(result.error))
      } else {
        resolve(result)
      }
    } catch {
      reject(new Error(`Failed to parse python output: ${stdout}`))
    }
  })
}

export async function runScrapeGraph(url: string, prompt: string): Promise<unknown> {
  return runPythonScript('run_scrapegraph.py', [url, prompt])
}

export async function runHermes(query: string): Promise<unknown> {
  return runPythonScript('run_hermes.py', [query])
}
