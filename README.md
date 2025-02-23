# News_Blog

## Clone the Git repository
```bash
git clone https://github.com/prasanthreddylomada/News_Blog.git
cd News_Blog
```


## Ensure you have conda installed

We use conda to create a virtual environment for the agent wrapper and scraper.

## Create a Virtual Environment
```bash
conda create -n NewsBlogPythonAll python=3.12.9
```

## Activate the Python Environment
```bash
conda activate NewsBlogPythonAll
```

## Install dependencies for the news source server and scraper
```bash
pip install -r news-source/requirements.txt
```

## Start the news source server in the background
```bash
python news-source/server.py &
```

## Ensure you have Node.js installed

## Install backend server dependencies
```bash
cd backend-server
npm install
```

## Start the backend server in the background
```bash
node index.js &
```

## Install frontend dependencies and start the frontend server
```bash
cd ../frontend
npm install
npm start
```