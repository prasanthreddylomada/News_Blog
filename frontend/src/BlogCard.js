import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function BlogCard({ blog }) {
  const [preview, setPreview] = useState({ title: "Loading...", content: "Fetching preview..." });

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(blog.url)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        const fetchedTitle = doc.querySelector("title")?.innerText || "No Title Available";
        let fetchedContent = doc.querySelector("meta[name='description']")?.content || "No preview available.";
        
        // Limit preview to 40 words
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
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{preview.title}</h5> {/* Smaller title */}
        <p className="card-text text-muted small">{preview.content}</p> {/* Smaller text */}

        <div className="d-flex justify-content-between align-items-center">
          <span className="badge bg-secondary">Tags: {blog.extraTags?.join(", ") || "None"}</span>
          <span className="badge bg-info">State: {blog.state}</span>
        </div>

        <div className="mt-3">
          <a href={blog.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Read Original
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
