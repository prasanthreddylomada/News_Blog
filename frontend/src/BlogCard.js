import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BlogCard.css"; // Import custom styles

function BlogCard({ blog }) {
  const [preview, setPreview] = useState({ title: "Loading...", content: "Fetching preview..." });
  const [showSummary, setShowSummary] = useState(false);
  const summaryPlaceholder = "This is a placeholder for the blog summary. The actual summary will be generated later.";

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(blog.url)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        const fetchedTitle = doc.querySelector("title")?.innerText || "No Title Available";
        let fetchedContent = doc.querySelector("meta[name='description']")?.content || "No preview available.";
        
        fetchedContent = fetchedContent.split(/\s+/).slice(0, 40).join(" ") + "...";

        setPreview({ title: fetchedTitle, content: fetchedContent });
      } catch (error) {
        console.error("Error fetching blog preview:", error);
        setPreview({ title: "Error Loading", content: "Could not fetch preview." });
      }
    }

    if (blog.url) {
      fetchPreview();
    }
  }, [blog.url]);

  return (
    <>
      <div className="card mb-3 shadow-sm d-flex flex-column" style={{ minHeight: "250px" }}>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title blog-title">{preview.title}</h5>
          <p className="card-text blog-preview flex-grow-1">{preview.content}</p>

          <div className="mt-auto d-flex justify-content-between">
            <a
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-custom-primary"
            >
              Read Original
            </a>
            <button
              className="btn btn-custom-secondary"
              onClick={() => setShowSummary(true)}
            >
              View Summary
            </button>
          </div>
        </div>
      </div>

      {/* Summary Popup (Full Screen) */}
      {showSummary && (
        <div className="summary-overlay">
          <div className="summary-popup">
            <button className="close-button" onClick={() => setShowSummary(false)}>✖</button>
            <h4>Blog Summary</h4>
            <p>{summaryPlaceholder}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default BlogCard;
