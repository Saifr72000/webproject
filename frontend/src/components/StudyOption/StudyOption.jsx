import React, { useState } from "react";
import "./StudyOption.css";

const StudyOption = ({
  option,
  isSelected,
  onSelect,
  comparisonType,
  ratingValue = 3,
  onRatingChange,
  binaryValue,
  onBinaryChange,
  showBinaryControls = false,
  isAnswered = false,
}) => {
  const [mediaError, setMediaError] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleMediaError = () => {
    setMediaError(true);
  };

  // Render binary controls for binary comparison type
  const renderBinaryControls = () => {
    return (
      <div className="binary-controls">
        <button
          className={`binary-btn yes-btn ${
            binaryValue === true ? "selected" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAnswered) onBinaryChange(option.id, true);
          }}
          disabled={isAnswered}
        >
          Yes
        </button>
        <button
          className={`binary-btn no-btn ${
            binaryValue === false ? "selected" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAnswered) onBinaryChange(option.id, false);
          }}
          disabled={isAnswered}
        >
          No
        </button>
      </div>
    );
  };

  // Render rating controls for rating comparison type
  const renderRatingControls = () => {
    return (
      <div className="rating-controls">
        <input
          type="range"
          min="1"
          max="5"
          value={ratingValue}
          className="rating-slider"
          onChange={(e) => {
            e.stopPropagation();
            if (!isAnswered)
              onRatingChange(option.id, parseInt(e.target.value));
          }}
          disabled={isAnswered}
        />
        <div className="rating-labels">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <div className="rating-value">{ratingValue}</div>
      </div>
    );
  };

  const renderMedia = () => {
    // If we have a direct URL, use it, otherwise construct from BASE_URL and ID
    const mediaUrl = `${BASE_URL}/api/stimuli/${option.id}`;

    switch (option.type) {
      case "image":
        return (
          <img
            src={mediaUrl}
            alt={option.title || "Study option"}
            onError={handleMediaError}
            className="option-media"
          />
        );
      case "video":
        return (
          <video
            controls
            src={mediaUrl}
            onError={handleMediaError}
            className="option-media"
          />
        );
      case "audio":
        return (
          <div className="audio-container">
            <audio
              controls
              src={mediaUrl}
              onError={handleMediaError}
              className="option-media"
            />
          </div>
        );
      case "pdf":
        return (
          <div className="pdf-container">
            <object
              data={mediaUrl}
              type="application/pdf"
              className="option-media pdf-frame"
              onError={handleMediaError}
            >
              <div className="pdf-fallback">
                <p>Your browser doesn't support embedded PDFs.</p>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-download-link"
                >
                  View PDF
                </a>
              </div>
            </object>
            <div className="pdf-overlay">
              <span>View PDF</span>
            </div>
          </div>
        );
      default:
        return <div className="media-error">Unsupported media type</div>;
    }
  };

  // Determine if the option should handle clicks for selection
  const handleClick = () => {
    // Don't allow selections if the question has been answered
    if (isAnswered) return;

    // For rating and binary, don't toggle selection on whole card click
    if (comparisonType !== "rating" && comparisonType !== "binary") {
      onSelect(option.id);
    }
  };

  // Get class names based on comparison type
  const getClassNames = () => {
    let classes = "study-option";

    // Only add selected class for selection-based comparisons
    if (
      comparisonType === "single-select" ||
      comparisonType === "multi-select"
    ) {
      classes += isSelected ? " selected" : "";
    }

    // Add special class for rating type
    if (comparisonType === "rating") {
      classes += " rating-option";
    }

    // Add special class for binary type
    if (comparisonType === "binary") {
      classes += " binary-option";
    }

    // Add class if the question has been answered
    if (isAnswered) {
      classes += " answered";
    }

    return classes;
  };

  return (
    <div className={getClassNames()} onClick={handleClick}>
      {mediaError ? (
        <div className="media-error">
          <span>Failed to load media</span>
        </div>
      ) : (
        renderMedia()
      )}

      {/* Render controls based on comparison type */}
      {comparisonType === "rating" && renderRatingControls()}
      {comparisonType === "binary" &&
        showBinaryControls &&
        renderBinaryControls()}
    </div>
  );
};

export default StudyOption;
