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
    if (selectedStates.includes(state)) {
      setSelectedStates([]);
    } else {
      setSelectedStates([state]);
    }
  };

  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchTerm(""); 
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="container mt-3" style={{padding:"0px"}}>
      {/* Filter by Tags */}
      <div className="position-relative mb-3" >
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
            style={{ paddingTop: "10px", minHeight: "40px"}}
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
        {/* <h6 className="me-2 mb-0">States:</h6> */}
        <div className="btn-group d-flex overflow-auto" style={{ paddingRight: "15px" }}>
          {availableStates.map((state, index) => (
            <button
              key={index}
              className={`btn ${selectedStates.includes(state) ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => handleStateClick(state)}
              style={{
                flex: "0 1 auto", // Allows buttons to resize based on text
                padding: "8px 15px", // Ensures text doesn’t touch edges
                minWidth: "fit-content", // Adjusts button width to text size
                maxWidth: "200px", // Prevents excessively wide buttons
                whiteSpace: "nowrap", // Prevents text from breaking into multiple lines
                textAlign: "center",
                marginRight: index === availableStates.length - 1 ? "25px" : "0px", 
              }}
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
