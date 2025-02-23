import time
import configparser
import scrapper  # Import scrapper instead of running it as a separate process
import requests

# Load server configuration
config = configparser.ConfigParser()
config.read('server.config')
sleep_time_minutes = config.getint('DEFAULT', 'sleep_time_minutes')
agent_wrapper_url = config.get("DEFAULT", "agent_wrapper_url")

# Load scrapper configuration
scrapper_config = configparser.ConfigParser()
scrapper_config.read("scrapper.config")

# Read sources and max URLs from config
sources_str = scrapper_config.get("DEFAULT", "sources")
sources = [s.strip() for s in sources_str.split(",")]
max_urls = scrapper_config.getint("DEFAULT", "max_urls")
backend_url = config.get("DEFAULT", "backend_url")  # Load backend URL from config

while True:
    all_articles = []

    # Scrape each source
    for source in sources:
        articles = scrapper.scrape_source(source, max_urls)  # Call function directly
        all_articles = all_articles + articles  # Store results
    
    articles_added, doc_ids = 0, []
    for i,article in enumerate(articles):
        # Get call to backend_url/exists for each article
        exists_response = requests.get(f"{backend_url}/exists", params={"url": article})
        
        if not exists_response.json().get("exists", False):  # If article doesn't exist
            response = requests.post(f"{backend_url}/add", json={
                "url": article,
                "registered_at": time.time(),
                "nationality": "India",
                "state": "Karnataka",
                "extraTags": [],
                "summary" : ""
            })

            if response.status_code == 201:
                articles_added += 1
                doc_ids += [response.json()["blog"]["_id"]]
            else :
                print(response)

    if doc_ids:
        print(f"Sending {len(doc_ids)} document IDs to Agent Wrapper: {doc_ids}")

        # Send document IDs to Agent Wrapper Server
        try:
            response = requests.post(f"{agent_wrapper_url}/process", json={"doc_ids": doc_ids})
            response.raise_for_status()
            print("Agent Wrapper acknowledged document processing.")
        except requests.exceptions.RequestException as e:
            print(f"Failed to notify Agent Wrapper: {e}")


    print("Articles Scraped : ",len(articles),"Articles Added : ",articles_added)

    # Sleep for the specified time before running again
    time.sleep(sleep_time_minutes * 60)
