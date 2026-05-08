export async function checkIntegrationStatus(provider: string): Promise<'connected' | 'disconnected' | 'error'> {
  const providers: Record<string, { url: string; method?: string }> = {
    ollama: { url: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/api/tags' },
    whisper: { url: process.env.WHISPER_API_URL || 'http://127.0.0.1:9000' },
    n8n: { url: process.env.N8N_BASE_URL || 'http://127.0.0.1:5678/rest/healthz' },
    cobalt: { url: process.env.COBALT_API_URL || 'http://127.0.0.1:9001' },
  }

  try {
    if (provider.toLowerCase() === 'scrapegraph') {
      return await checkPythonModule('scrapegraphai') ? 'connected' : 'disconnected'
    }
    if (provider.toLowerCase() === 'hermes') {
      return await checkPythonModule('hermes_agent') ? 'connected' : 'disconnected'
    }

    const config = providers[provider.toLowerCase()]
    if (!config) return 'disconnected'

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 2000)
    
    const res = await fetch(config.url, { 
      method: config.method || 'GET',
      signal: controller.signal 
    }).catch(() => null)
    
    clearTimeout(id)

    if (res && res.ok) return 'connected'
    if (res && res.status < 500) return 'connected'
    
    return 'disconnected'
  } catch (err) {
    return 'disconnected'
  }
}

async function checkPythonModule(moduleName: string): Promise<boolean> {
  try {
    const { spawn } = await import('child_process')
    const path = await import('path')

    const isWindows = process.platform === 'win32'
    const venvBin = isWindows ? 'Scripts' : 'bin'
    const pythonBin = isWindows ? 'python.exe' : 'python3'
    const localVenv = path.join(process.cwd(), 'lib', 'python_env', venvBin, pythonBin)
    const systemPython = isWindows ? 'python' : 'python3'

    const trySpawn = (executable: string) =>
      new Promise<boolean>((resolve) => {
        const proc = spawn(executable, ['-c', `import ${moduleName}`])
        proc.on('close', (code) => resolve(code === 0))
        proc.on('error', () => resolve(false))
      })

    const localResult = await trySpawn(localVenv)
    if (localResult) return true
    return trySpawn(systemPython)
  } catch {
    return false
  }
}
