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
    return title.count("-") >= 2  # At least two hyphens in the title

def scrape_source(source, max_urls):
    """Scrapes news articles from the given source URL and returns valid article URLs."""
    print(f"Scraping source: {source}")

    try:
        # Fetch the webpage
        response = requests.get(source, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()  # Raise error for bad responses (4xx, 5xx)

        # Parse HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the div containing "India News"
        india_news_div = None
        for div in soup.find_all("div"):
            if "India News" in div.get_text(strip=True):
                india_news_div = div
                break  # Stop searching once found

        if not india_news_div:
            print("No 'India News' section found.")
            return []

        # Extract valid article URLs
        urls = set()
        for link in india_news_div.find_all("a", href=True):
            url = urljoin(source, link["href"])  # Convert to absolute URL
            title = extract_title_from_url(url)

            if is_valid_title(title):  # Apply filtering condition
                urls.add(url)
            
            if len(urls) >= max_urls:
                break  # Stop if max URLs reached

        return list(urls)  # Return the URLs instead of printing

    except requests.exceptions.RequestException as e:
        print(f"Error fetching {source}: {e}")
        return []
