import sys
import json
from scrapegraphai.graphs import SmartScraperGraph

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: python run_scrapegraph.py <url> <prompt>"}))
        return

    url = sys.argv[1]
    prompt = sys.argv[2]
    
    # Use llama3.2 as pulled in the environment
    graph_config = {
        "llm": {
            "model": "ollama/llama3.2",
            "base_url": "http://localhost:11434",
        },
        "embeddings": {
            "model": "ollama/nomic-embed-text",
            "base_url": "http://localhost:11434",
        }
    }

    try:
        smart_scraper_graph = SmartScraperGraph(
            prompt=prompt,
            source=url,
            config=graph_config
        )

        result = smart_scraper_graph.run()
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
