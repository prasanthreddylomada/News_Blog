import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa"; // Import FontAwesome search icon

function SearchBar({ availableTags, selectedTags, setSelectedTags, availableStates, selectedStates, setSelectedStates }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTags(
        availableTags.filter(
          (tag) => tag.toLowerCase().startsWith(searchTerm.toLowerCase()) && !selectedTags.includes(tag)
        )
      );
    } else {
      setFilteredTags([]);
    }
  }, [searchTerm, availableTags, selectedTags]);

  const handleStateClick = (state) => {
    setSelectedStates([state]); // Only one state is selected at a time
  };

  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchTerm(""); // Clear search input after selection
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="container mt-3">
      {/* Filter by Tags */}
      <div className="position-relative mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTags.length > 0 && (
          <div className="dropdown-menu show w-100 position-absolute">
            {filteredTags.map((tag, index) => (
              <button key={index} className="dropdown-item" onClick={() => handleTagSelect(tag)}>
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3 d-flex align-items-center">
          <h6 className="me-2 mb-0">Selected Tags:</h6>
          <div>
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="badge bg-primary me-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={() => handleTagRemove(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter by States */}
      <div className="d-flex align-items-center mb-2">
        <h6 className="me-2 mb-0">States:</h6>
        <div className="btn-group d-flex overflow-auto">
          {availableStates.map((state, index) => (
            <button
              key={index}
              className={`btn ${selectedStates.includes(state) ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => handleStateClick(state)}
              style={{ minWidth: "10%", flex: "1 1 auto", whiteSpace: "nowrap" }}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
