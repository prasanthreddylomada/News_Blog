import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BlogCard.css"; // Import custom styles

function BlogCard({ blog }) {
  const [preview, setPreview] = useState({
    title: "Loading...",
    content: "Fetching preview...",
  });
  const [showSummary, setShowSummary] = useState(false);
  const summaryPlaceholder =
    "Title: No Summary Available\nSubtitle: Please check back later.";

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(blog.url)}`
        );
        const data = await response.json();

        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        const fetchedTitle =
          doc.querySelector("title")?.innerText || "No Title Available";
        let fetchedContent =
          doc.querySelector("meta[name='description']")?.content ||
          "No preview available.";

        fetchedContent =
          fetchedContent.split(/\s+/).slice(0, 40).join(" ") + "...";

        setPreview({ title: fetchedTitle, content: fetchedContent });
      } catch (error) {
        console.error("Error fetching blog preview:", error);
        setPreview({
          title: "Error Loading",
          content: "Could not fetch preview.",
        });
      }
    }

    if (blog.url) {
      fetchPreview();
    }
  }, [blog.url]);

  // Helper function to parse the summary text into styled components
  function parseSummary(summary) {
    // Split by newlines and filter out empty lines
    const lines = summary.split("\n").filter((line) => line.trim() !== "");
    return lines.map((line, index) => {
      if (line.startsWith("Title:")) {
        return (
          <h4 key={index} className="blog-summary-title">
            {line.replace("Title:", "").trim()}
          </h4>
        );
      } else if (line.startsWith("Subtitle:")) {
        return (
          <h5 key={index} className="blog-summary-subtitle">
            {line.replace("Subtitle:", "").trim()}
          </h5>
        );
      } else {
        return (
          <p key={index} className="blog-summary-text">
            {line}
          </p>
        );
      }
    });
  }

  return (
    <>
      {/* Blog Card */}
      <div
        className="card mb-3 shadow-sm d-flex flex-column"
        style={{ minHeight: "250px" }}
      >
        <div className="card-body d-flex flex-column">
          <h5 className="card-title blog-title font-weight-bold">
            {preview.title}
          </h5>
          <p className="card-text blog-preview flex-grow-1 text-muted">
            {preview.content}
          </p>

          {/* Buttons */}
          <div className="mt-auto d-flex justify-content-between">
            <a
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary font-weight-bold"
            >
              Read Original
            </a>
            <button
              className="btn btn-secondary font-weight-bold"
              onClick={() => setShowSummary(true)}
            >
              View Summary
            </button>
          </div>
        </div>
      </div>

      {/* Summary Popup (Full Screen) */}
      {showSummary && (
        <div className="summary-overlay d-flex align-items-center justify-content-center">
          <div className="summary-popup p-4 bg-white shadow-lg rounded">
            <button
              className="close-button btn btn-danger"
              onClick={() => setShowSummary(false)}
            >
              ✖
            </button>
            <div className="blog-summary-content">
              {parseSummary(
                blog.summary === "" ? summaryPlaceholder : blog.summary
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BlogCard;
