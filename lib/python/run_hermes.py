import sys
import json
import os
import subprocess

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing query argument."}))
        return

    query = sys.argv[1]
    
    # Path to hermes-agent run_agent.py
    hermes_dir = os.path.join(os.getcwd(), 'lib', 'hermes-agent')
    run_agent_path = os.path.join(hermes_dir, 'run_agent.py')
    
    # We use the current python environment
    python_exe = sys.executable

    try:
        # Run hermes-agent via CLI
        # We use --model to specify the local ollama model
        # Note: Hermes expects a certain format for models, e.g., "ollama/llama3.2"
        process = subprocess.Popen(
            [python_exe, run_agent_path, "--query", query, "--model", "ollama/llama3.2", "--base_url", "http://localhost:11434/v1"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=hermes_dir
        )

        stdout, stderr = process.communicate()

        if process.returncode != 0:
            print(json.dumps({"error": stderr or "Unknown error", "code": process.returncode}))
            return

        # Hermes output is usually text, we might need to parse the "FINAL RESPONSE" section
        if "🎯 FINAL RESPONSE:" in stdout:
            response = stdout.split("🎯 FINAL RESPONSE:")[1].split("📋 CONVERSATION SUMMARY")[0].strip()
            # Remove the separator lines if they exist
            response = response.replace("-" * 30, "").strip()
            print(json.dumps({"response": response}))
        else:
            print(json.dumps({"response": stdout, "warning": "Could not find explicit final response marker"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
