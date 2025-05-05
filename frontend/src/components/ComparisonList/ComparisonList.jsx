import React from "react";
import "./ComparisonList.css";

const ComparisonList = ({ comparisons }) => {
  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  // Helper function to format comparison type for display
  const formatComparisonType = (type) => {
    switch (type) {
      case "binary":
        return "Binary Comparison";
      case "rating":
        return "Rating Scale";
      case "single-select":
        return "Single Select";
      case "multiselect":
        return "Multiselect";
      default:
        return type;
    }
  };

  // Helper function to render the appropriate stimuli preview
  const renderStimuliPreview = (stimulus, index, stimuliType = "image") => {
    const label = String.fromCharCode(65 + index);

    if (!stimulus) {
      return null;
    }

    if (!stimuliType || stimuliType === "image") {
      return (
        <div key={index} className="comparison-image-container">
          <img
            src={stimulus.url || ""}
            alt={`Stimulus ${label}`}
            className="comparison-image"
          />
          <div className="image-label">{label}</div>
        </div>
      );
    }

    // Get icon based on stimuli type
    const getTypeIcon = () => {
      switch (stimuliType) {
        case "video":
          return "🎬";
        case "audio":
          return "🔊";
        case "pdf":
          return "📄";
        default:
          return "📷";
      }
    };

    return (
      <div key={index} className="comparison-file-container">
        <div className="file-type-icon">{getTypeIcon()}</div>
        <div className="file-name">
          {stimulus.originalName || `File ${label}`}
        </div>
        <div className="file-label">{label}</div>
      </div>
    );
  };

  return (
    <div className="comparison-list">
      <h3>Study Comparisons</h3>

      <div className="comparison-grid">
        {comparisons.map((comparison) => {
          // Get all stimuli from the comparison
          const stimuli = Object.keys(comparison)
            .filter((key) => key.startsWith("stimulus") && comparison[key])
            .map((key) => comparison[key]);

          return (
            <div key={comparison._id} className="comparison-item">
              <div className="comparison-header">
                <h4>{comparison.title}</h4>
                <div className="comparison-badges">
                  <span className="comparison-type">
                    {formatComparisonType(comparison.type)}
                  </span>
                  {comparison.stimuliType && (
                    <span className={`stimuli-type ${comparison.stimuliType}`}>
                      {comparison.stimuliType}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`comparison-files ${
                  stimuli.length > 2 ? "multi-stimuli" : ""
                } ${comparison.stimuliType || "image"}-type`}
              >
                {stimuli.map((stimulus, index) =>
                  renderStimuliPreview(stimulus, index, comparison.stimuliType)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonList;
