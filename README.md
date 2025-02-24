# News Blog

Ai Agent driven News Blogging Framework, it continuosly monitors information sources for new News Articles. When a new article appears, it automatically summarizes it and stores in DB, Performs Named Entity Recognition (NER) on the artcile(to group multiple articles which carry closely related data) & performs location analysis to extract the geo location of the news. 

Checkout the table of contents to a get a better picture !!

---

## Table of Contents
1. [Modules](#modules)  
2. [File Structure](#file-structure)  
3. [System Flow Diagram](#system-flow-diagram)  
4. [Setup Instructions](#setup-instructions)  
5. [How It Works](#how-it-works)  
6. [Configuration](#configuration)  
7. [License](#license)  

---

## Modules 

- **news-source**: Watches for new articles in `$sources` at periodic intervals of `$sleep_time_minutes`. Makes an entry in DB (via `backend-server`) and Notifys `news_flow`.
- **news_flow**: Queues articles received from `news-sources`. Calls `agent-wrapper` to generate Summary, Entities, Location Analysis. 
- **agent-wrapper**: API end point for Ai Agent. Given article link, performs Summarization, Named Entity Recognition & Location Analysis. Updates entry in DB (via `backend-server`) with information extracted by Ai Agent.
- **backend-server**: Interface to access MongoDb database, accessed by `news-source`, `agent-wrapper` & `frontend`.
- **frontend**: A React application that displays the processed news articles to end users.

All the units perform independently, it is very easy to add a new module. Also, no hardcoding was done, all important variables are stored in respective config files. Do Check Them Out !!

---

## File Structure

A high-level view of the repository:

```
News_Blog
├── agent-wrapper
│   ├── agent_wrapper.py
│   └── server.config
├── backend-server
│   ├── .gitignore
│   ├── index.js
│   ├── netlify.toml
│   ├── package.json
│   ├── package-lock.json
│   ├── server.config.js
│   └── temp.txt
├── frontend
│   ├── public
│   ├── src
│   ├── .gitignore
│   ├── README.md
│   ├── package.json
│   └── package-lock.json
├── news-source
│   ├── .gitignore
│   ├── scrapper.config
│   ├── scrapper.py
│   ├── server.config
│   └── server.py
├── news_flow
│   ├── db
│   ├── src/news_flows
|       ├── agent_wrapper.py
|       ├── crews
|       ├── tools
|       └── server.config
│   ├── .gitignore
│   ├── README.md
│   ├── pyproject.toml
│   └── uv.lock
├── LICENSE
├── README.md
└── requirements.txt
```

## Setup Instructions

### Prerequisites
- Conda (for Python virtual environments)
- Python (3.12.9 recommended)
- Node.js (LTS version recommended)
- MongoDB (local or remote instance)

### Installation and Running

Clone the Git repository:

```bash
git clone https://github.com/prasanthreddylomada/News_Blog.git
cd News_Blog
```

Create and activate a Conda environment:

```bash
conda create -n NewsBlogPythonAll python=3.12.9
conda activate NewsBlogPythonAll
```

Install dependencies for the news source server and scraper:

```bash
pip install -r requirements.txt
```

Downaload and insall ollama from https://ollama.com/download

Downlaod Install Mistral model (Base LLM For Agent) from https://github.com/ollama/ollama

Run Mistral Model
```bash
ollama run mistral
```

Run the LLM in new a terminal
```bash
taskkill /IM "ollama.exe" /F && ollama serve
```

Install Node.js dependencies for the backend server:

```bash
cd backend-server
npm install
```

Start the backend server (in the background if desired):

```bash
node index.js &
```

Open a new terminal & Start the Ai Agent:

```bash
cd news_flows/src/news_flows
python agent_wrapper.py 
```

Open a new terminal & Start the news source server:

```bash
cd news-source/
python server.py 
```

Open a new terminal & Install frontend dependencies and start the frontend server:

```bash
cd frontend/
npm install
npm start
```

---

## How It Works [Non Technical]

- news-source scrapes external sources at a configurable interval (specified in scrapper.config) and checks for new articles.
- When new articles are found, they are stored in the backend (MongoDB) and the news_flow service is notified.
- news_flow calls the agent-wrapper, which performs:
  - Named Entity Recognition (NER)
  - Location Analysis
  - Summary generation
- The processed data (with NER, state tags, and summaries) is then sent to the backend-server, which stores it in MongoDB.
- The frontend (React app) fetches the processed articles from the backend-server and displays them to users.
---

## How It Works Diagram

```mermaid
sequenceDiagram
    participant NS as news-source
    participant NF as news_flow
    participant AW as agent-wrapper
    participant BS as backend-server
    participant FE as frontend

    NS->>BS: Store new URLs
    NS->>NF: Notify new URLs
    NF->>AW: Process URLs (NER, state, summary)
    AW->>NF: Return processed data
    NF->>BS: Store processed data
    FE->>BS: Fetch processed articles
    BS->>FE: Return processed articles
```

---

## Configuration

This project is designed to be flexible and open-ended, allowing you to easily modify scraping intervals, MongoDB URIs, or any other parameters. Below are the default configuration files and their parameters. Adjust these as needed for your environment.

### 1. Agent Wrapper Configuration
**Location:** `agent-wrapper/server.config`  
**Default Content:**

```ini
[DEFAULT]
mongoURI = mongodb+srv://dbUser:dbPassword@blog.882k5.mongodb.net/?retryWrites=true&w=majority&appName=blog
sleep_time_minutes = 10
backend_url = http://localhost:5000
process_sleep_time = 30
```

**Parameters:**
- `mongoURI`: MongoDB connection string.
- `sleep_time_minutes`: Interval (in minutes) to check for new data or tasks.
- `backend_url`: URL of the backend server.
- `process_sleep_time`: Time (in seconds) to pause between processing tasks.

### 2. Backend Server Configuration
**Location:** `backend-server/server.config.js`  
**Default Content:**

```js
module.exports = {
  mongoURI: 'mongodb+srv://dbUser:dbPassword@blog.882k5.mongodb.net/?retryWrites=true&w=majority&appName=blog', // Replace with your credentials
  maxResults: 100,
  port: 5000
};
```

**Parameters:**
- `mongoURI`: MongoDB connection string.
- `maxResults`: Maximum number of results to return in queries.
- `port`: The port on which the backend server runs.

### 3. News Source Configuration
**Location:** `news-source/server.config`  
**Default Content:**

```ini
[DEFAULT]
sleep_time_minutes = 10
backend_url = http://localhost:5000
agent_wrapper_url = http://localhost:5001
```

**Parameters:**
- `sleep_time_minutes`: Interval (in minutes) for scraping new articles.
- `backend_url`: URL of the backend server.
- `agent_wrapper_url`: URL of the agent-wrapper server.

### 4. News Flow Configuration
**Location:** `news_flow/server.config`  
**Default Content:**

```ini
[DEFAULT]
mongoURI = mongodb+srv://dbUser:dbPassword@blog.882k5.mongodb.net/?retryWrites=true&w=majority&appName=blog
sleep_time_minutes = 10
backend_url = http://localhost:5000
process_sleep_time = 30
```

**Parameters:**
- `mongoURI`: MongoDB connection string.
- `sleep_time_minutes`: Interval (in minutes) to check for new URLs from news-source.
- `backend_url`: URL of the backend server.
- `process_sleep_time`: Time (in seconds) to pause between processing tasks.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software in accordance with the license terms.
