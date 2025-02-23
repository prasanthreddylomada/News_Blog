import configparser
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def extract_title_from_url(url):
    """Extracts the last part of the URL after the final '/'."""
    parsed_url = urlparse(url)
    title = parsed_url.path.rstrip("/").split("/")[-1]
    return title

def is_valid_title(title):
    """Checks if the title contains at least two instances of a single '-' (hyphen)."""
    return title.count("-") >= 3  # Ensures at least two single '-' exist

def scrape_source(source, max_urls):
    print(f"Scraping source: {source}")

    try:
        # Fetch the webpage
        response = requests.get(source, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)

        # Parse the HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the div containing the text "India News"
        india_news_div = None
        for div in soup.find_all("div"):
            if "India News" in div.get_text(strip=True):
                india_news_div = div
                break  # Stop searching once found

        if not india_news_div:
            print("No 'India News' section found.")
            return

        # Find sub-divs containing URLs
        urls = set()  # Use a set to avoid duplicates
        for link in india_news_div.find_all("a", href=True):
            url = urljoin(source, link["href"])  # Ensure absolute URLs
            title = extract_title_from_url(url)

            if is_valid_title(title):  # Apply filtering condition
                urls.add(url)
            
            if len(urls) >= max_urls:
                break  # Stop if max URLs reached

        # Print filtered URLs
        if urls:
            print(f"Found {len(urls)} valid articles:")
            for url in urls:
                print(url)
        else:
            print("No valid articles found.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching {source}: {e}")

if __name__ == "__main__":
    # Load scrapper configuration
    config = configparser.ConfigParser()
    config.read("scrapper.config")
    
    # Read sources and max URLs from config
    sources_str = config.get("DEFAULT", "sources")
    sources = [s.strip() for s in sources_str.split(",")]
    max_urls = config.getint("DEFAULT", "max_urls")

    # Process each source
    for source in sources:
        scrape_source(source, max_urls)
