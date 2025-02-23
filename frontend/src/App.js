import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import BlogCard from './BlogCard';
import './App.css';

function App() {
  const backendUrl = 'http://localhost:5000'; // Adjust port if needed
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Fetch filter options (tags and states) from backend
  useEffect(() => {
    axios.get(`${backendUrl}/filters`)
      .then(response => {
        setAvailableTags(response.data.tags);
        setAvailableStates(response.data.states);
      })
      .catch(error => console.error("Error fetching filters:", error));
  }, [backendUrl]);

  // Fetch blogs whenever selected tags or states change
  useEffect(() => {
    const params = {};
    if (selectedTags.length) {
      params.tags = selectedTags.join(',');
    }
    if (selectedStates.length) {
      params.states = selectedStates.join(',');
    }
    axios.get(`${backendUrl}/search`, { params })
      .then(response => setBlogs(response.data.blogs))
      .catch(error => console.error("Error fetching blogs:", error));
  }, [selectedTags, selectedStates, backendUrl]);

  return (
    <div className="container">
      {/* Title and SearchBar in a Row without top margin */}
      <div className="d-flex align-items-center justify-content-between" style={{ marginTop: '0' }}>
        <h1 className="news-blog-title">News Blog</h1> {/* Moved 10px left */}
        <div className="flex-grow-1 d-flex justify-content-center" style={{ marginTop: '0' }}>
          <SearchBar 
            availableTags={availableTags} selectedTags={selectedTags} setSelectedTags={setSelectedTags} 
            availableStates={availableStates} selectedStates={selectedStates} setSelectedStates={setSelectedStates} 
          />
        </div>
      </div>

      {/* News Section */}
      <div className="news-section">
        <div className="blogs">
          {blogs.map((blog, index) => (
            <BlogCard key={index} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
