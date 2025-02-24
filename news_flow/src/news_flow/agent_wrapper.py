import configparser
import time
import threading
import requests
import json
from flask import Flask, request, jsonify
from pymongo import MongoClient
from bs4 import BeautifulSoup
from bson import ObjectId  # Import ObjectId

from crews.Summarise_crew.Summarise_crew import SummariseCrew
from crews.NER_crew.NER_crew import NERCrew
# Load configuration
config = configparser.ConfigParser()
config.read('server.config')
mongo_uri = config.get("DEFAULT", "mongoURI")
process_sleep_time = config.getint("DEFAULT", "process_sleep_time")  # in seconds

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["test"]  # 'blogs' is the database name

# Global processing queue (list of document IDs as strings)
processing_queue = []

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_docs():
    data = request.get_json()
    if not data or "doc_ids" not in data:
        return jsonify({"error": "No doc_ids provided"}), 400
    doc_ids = data["doc_ids"]
    processing_queue.extend(doc_ids)  # Add received doc_ids to processing queue
    print(f"Received doc_ids: {doc_ids}. Current queue: {processing_queue}")
    return jsonify({"message": "Doc IDs added to processing queue"}), 200

def scrape_website(url):
    """Fetches article content from the given URL."""
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()  # Raise error if request failed
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract the main content (modify based on website structure)
        paragraphs = soup.find_all("p")  # Get all <p> tags
        content = " ".join([p.get_text(strip=True) for p in paragraphs])  # Concatenate text
        
        return content if content else "No content extracted."
    
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def mock_ner(text):
    result = (
        NERCrew()
        .crew()
        .kickoff(inputs={'paragraph': text})
    )

    result_json = json.loads(result.raw)
    return result_json["ner"],result_json["state"]

def mock_summary(text):
    result = (
        SummariseCrew()
        .crew()
        .kickoff(inputs={'information': text})
    )

    return result.raw

def process_queue():
    """Processes document IDs from the queue."""
    while True:
        if processing_queue:
            doc_id_str = processing_queue.pop(0)
            try:
                oid = ObjectId(doc_id_str)
            except Exception as e:
                print(f"Invalid doc_id {doc_id_str}: {e}")
                continue

            print(f"Processing doc_id: {doc_id_str}")

            # Fetch document details from the "blogs" collection
            doc = db.blogs.find_one({"_id": oid})
            print(f"Document details: {doc}")
            if not doc or "url" not in doc:
                print(f"Document {doc_id_str} not found or missing URL.")
                continue

            url = doc["url"]
            print(f"Scraping URL: {url}")
            
            # Scrape website content
            article_content = scrape_website(url)
            print(f"Scraped content: {article_content[:100]}...")  # Print first 100 characters
            if not article_content:
                print(f"Failed to scrape content for {url}")
                continue

            # Process with mock NER and summary functions
            ner_result, state = mock_ner(article_content)
            summary_result = mock_summary(article_content)

            # Update the document in MongoDB with NER and summary
            result = db.blogs.update_one(
                {"_id": oid},
                {"$set": {"extraTags": ner_result,"state" : state, "summary": summary_result}}
            )

            if result.modified_count:
                print(f"Updated doc_id {doc_id_str} with NER and summary.")
            else:
                print(f"Failed to update doc_id {doc_id_str} or no changes were needed.")

        else:
            print("Processing queue empty, sleeping...")
            time.sleep(process_sleep_time)

if __name__ == '__main__':
    # Start the background thread to process the queue
    processing_thread = threading.Thread(target=process_queue, daemon=True)
    processing_thread.start()

    # Run the Flask app on port 5001
    app.run(host="0.0.0.0", port=5001)
