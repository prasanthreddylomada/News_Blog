import time
import configparser
import scrapper  # Import scrapper instead of running it as a separate process

# Load server configuration
config = configparser.ConfigParser()
config.read('server.config')
sleep_time_minutes = config.getint('DEFAULT', 'sleep_time_minutes')

# Load scrapper configuration
scrapper_config = configparser.ConfigParser()
scrapper_config.read("scrapper.config")

# Read sources and max URLs from config
sources_str = scrapper_config.get("DEFAULT", "sources")
sources = [s.strip() for s in sources_str.split(",")]
max_urls = scrapper_config.getint("DEFAULT", "max_urls")

while True:
    all_articles = []

    # Scrape each source
    for source in sources:
        articles = scrapper.scrape_source(source, max_urls)  # Call function directly
        all_articles = all_articles + articles  # Store results

    # Send articles to wherever they need to go (e.g., save to DB, API, etc.)
    print("Scraped Articles:", all_articles)  # Replace with actual processing logic

    # Sleep for the specified time before running again
    time.sleep(sleep_time_minutes * 60)
