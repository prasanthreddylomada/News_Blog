import configparser
import time
import threading
from flask import Flask, request, jsonify
from pymongo import MongoClient

# Load configuration
config = configparser.ConfigParser()
config.read('server.config')
mongo_uri = config.get("DEFAULT", "mongoURI")
process_sleep_time = config.getint("DEFAULT", "process_sleep_time")  # in seconds

# Connect to MongoDB
client = MongoClient(mongo_uri)
# Use a specific database (adjust "blogs" as needed)
db = client["blogs"]

# Global processing queue (list of document IDs)
processing_queue = []

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_docs():
    data = request.get_json()
    if not data or "doc_ids" not in data:
        return jsonify({"error": "No doc_ids provided"}), 400
    doc_ids = data["doc_ids"]
    # Add received doc_ids to the processing queue
    processing_queue.extend(doc_ids)
    print(f"Received doc_ids: {doc_ids}. Current queue: {processing_queue}")
    return jsonify({"message": "Doc IDs added to processing queue"}), 200

def mock_ner(doc_id):
    # Mock function simulating Named Entity Recognition
    return ["Entity1", "Entity2", "Entity3"]

def mock_summary(doc_id):
    # Mock function simulating summary generation
    return f"This is a generated summary for document {doc_id}."

def process_queue():
    while True:
        if processing_queue:
            # Get the first document ID from the queue
            doc_id = processing_queue.pop(0)
            print(f"Processing doc_id: {doc_id}")
            # Call mock functions
            ner_result = mock_ner(doc_id)
            summary_result = mock_summary(doc_id)
            # Update the document in MongoDB (assumes collection "blogs")
            result = db.blogs.update_one(
                {"_id": doc_id},
                {"$set": {"ner": ner_result, "summary": "summary"}}
            )
            if result.modified_count:
                print(f"Updated doc_id {doc_id} with NER and summary.")
            else:
                print(f"Failed to update doc_id {doc_id} or no changes were needed.")
        else:
            print("Processing queue empty, sleeping...")
            time.sleep(process_sleep_time)

if __name__ == '__main__':
    # Start the background thread to process the queue
    processing_thread = threading.Thread(target=process_queue, daemon=True)
    processing_thread.start()

    # Run the Flask app on a desired port (e.g., 5001)
    app.run(host="0.0.0.0", port=5001)
