import React, { useState } from "react";
import "./StudyOption.css";

const StudyOption = ({ option, isSelected, onSelect }) => {
  const [mediaError, setMediaError] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleMediaError = () => {
    setMediaError(true);
  };

  const renderMedia = () => {
    // If we have a direct URL, use it, otherwise construct from BASE_URL and ID
    const mediaUrl = option.url || `${BASE_URL}/api/stimuli/${option.id}`;

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
            <iframe
              src={`${mediaUrl}#toolbar=0`}
              title={option.title || "PDF Document"}
              onError={handleMediaError}
              className="option-media pdf-frame"
            />
            <div className="pdf-overlay">
              <span>View PDF</span>
            </div>
          </div>
        );
      default:
        return <div className="media-error">Unsupported media type</div>;
    }
  };

  return (
    <div
      className={`study-option ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(option.id)}
    >
      {mediaError ? (
        <div className="media-error">
          <span>Failed to load media</span>
        </div>
      ) : (
        renderMedia()
      )}
      {option.title && <div className="option-title">{option.title}</div>}
    </div>
  );
};

export default StudyOption;
