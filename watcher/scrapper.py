import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# Set of URLs already visited to avoid loops
visited_urls = set()

def is_internal_link(link, base_domain):
    parsed = urlparse(link)
    return parsed.netloc.endswith(base_domain) or parsed.netloc == ''

def process_news_page(soup, url):
    """
    Process and extract news co ntent from the page.
    This is a placeholder function; you would add logic here to:
    - Identify if the page is a news article (based on HTML structure or URL patterns).
    - Extract the title, content, publication date, etc.
    - Send the URL/content to your Topic & NER agent.
    - Optionally, store preliminary data in MongoDB.
    """
    print(f"Processing news article: {url}")
    title = soup.find('h1')
    content = soup.find('div', {'class': 'full_story'})
    if title and content:
        article_data = {
            "url": url,
            "title": title.get_text(strip=True),
            "content": content.get_text(separator=' ', strip=True)
        }
        # Here you might call your agent and save to MongoDB:
        # agent_response = send_to_topic_ner_agent(article_data)
        # save_to_mongodb(agent_response)
        print("Extracted Title:", article_data["title"])
    else:
        print("Not a news article or unable to extract key elements.")

def crawl(url, base_domain, max_depth=2, current_depth=0):
    if current_depth > max_depth:
        return
    if url in visited_urls:
        return
    visited_urls.add(url)
    
    try:
        print(f"Crawling: {url} at depth {current_depth}")
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Process page if it looks like a news article
        # (This condition can be adjusted based on actual HTML structure or URL patterns.)
        if '/news/' in url or soup.find('div', {'class': 'full_story'}):
            process_news_page(soup, url)
        
        # Find and crawl internal links
        for a_tag in soup.find_all('a', href=True):
            link = urljoin(url, a_tag['href'])
            if is_internal_link(link, base_domain) and link not in visited_urls:
                # Throttle requests to avoid hammering the server
                time.sleep(1)
                crawl(link, base_domain, max_depth, current_depth + 1)
    except Exception as e:
        print(f"Error crawling {url}: {e}")

if __name__ == "__main__":
    start_url = "https://www.indiatoday.in/"
    base_domain = "indiatoday.in"
    crawl(start_url, base_domain)
