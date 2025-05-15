import React, { useState } from "react";
import "./ComparisonForm.css";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const ComparisonForm = ({ studyId, onSaveComparison, onUpdateComparison, onCancel, loading, initialData = null }) => {
const [title, setTitle] = useState(initialData?.title || "");
const [type, setType] = useState(initialData?.type || "binary");
const [stimuliType, setStimuliType] = useState(initialData?.stimuliType || "image");
const [removedStimuli, setRemovedStimuli] = useState([]);


const [stimuli, setStimuli] = useState(() => {
  if (initialData?.stimuli && Array.isArray(initialData.stimuli)) {
    return initialData.stimuli.map((stim, index) => {
      const previewUrl =
        stim.preview || // fallback if it already has preview
        (stim.originalId ? `${BASE_URL}/api/files/${stim.originalId}` : null);

      return {
        id: `stimulus-${index}`,
        file: null,
        preview: previewUrl,
        fileName: stim.fileName || `Stimulus ${index + 1}`,
        originalId: stim.originalId,
        persisted: true,
      };
    });
  }
  return [{ id: "stimulus-0", file: null, preview: null }];
});




  const [error, setError] = useState("");

  const handleStimulusChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type matches selected stimuli type
      const fileTypeMap = {
        image: ["image/"],
        video: ["video/"],
        audio: ["audio/"],
        pdf: ["application/pdf"],
      };

      const isValidType = fileTypeMap[stimuliType].some((type) =>
        file.type.startsWith(type)
      );

      if (isValidType) {
        // Update the specific stimulus in the array
        setStimuli((currentStimuli) =>
          currentStimuli.map((stim) =>
            stim.id === id
              ? {
                  ...stim,
                  file,
                  preview:
                    stimuliType === "image" ? URL.createObjectURL(file) : null,
                  fileName: file.name,
                }
              : stim
          )
        );
      } else {
        setError(`Please select a ${stimuliType} file`);
      }
    }
  };

  const addStimulus = () => {
    if (stimuli.length >= 5) {
      setError("Maximum 5 stimuli allowed");
      return;
    }

    const newId = `stimulus-${stimuli.length}`;
    setStimuli([...stimuli, { id: newId, file: null, preview: null }]);
  };



  const removeStimulus = (id) => {
  if (stimuli.length <= 1) return;

  const stimulusToRemove = stimuli.find((stim) => stim.id === id);

  if (stimulusToRemove?.persisted && stimulusToRemove?.originalId) {
    setRemovedStimuli((prev) => [...prev, stimulusToRemove.originalId]);
  }

  if (stimulusToRemove?.preview?.startsWith("blob:")) {
    URL.revokeObjectURL(stimulusToRemove.preview);
  }

  setStimuli((prev) => prev.filter((stim) => stim.id !== id));
};







const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!title.trim()) {
    setError("Comparison title is required");
    return;
  }

  // Check if at least one stimulus has been uploaded
  const hasStimulus = stimuli.some((stim) => stim.file !== null || stim.preview !== null);
  if (!hasStimulus) {
    setError(`At least one ${stimuliType} file is required`);
    return;
  }
  

  try {
    // Prepare form data for API call
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("stimuliType", stimuliType);

  if (removedStimuli.length > 0) {

  removedStimuli.forEach((id) => formData.append("removedStimuli[]", id));
}

    // Append all stimuli files
    stimuli.forEach((stimulus) => {
      if (stimulus.file) {
        formData.append("stimuli", stimulus.file);
      }
    });


  for (let pair of formData.entries()) {
    console.log("  ", pair[0], "=>", pair[1]);
  }


for (let [key, value] of formData.entries()) {
  console.log(`  ${key} =>`, value);
}


    if (initialData && initialData._id) {
      await onUpdateComparison(initialData._id, formData);
    } else {
      await onSaveComparison(formData);

      setTitle("");
      setType("binary");
      setStimuliType("image");
      setStimuli([{ id: "stimulus-0", file: null, preview: null }]);
    }
  } catch (err) {
    console.error("Error in ComparisonForm:", err);
    setError("Failed to save comparison. Please try again.");
  }
};




  // Get the appropriate accept attribute for file input based on stimuli type
  const getAcceptAttribute = () => {
    switch (stimuliType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      case "pdf":
        return "application/pdf";
      default:
        return "image/*";
    }
  };

  // Get the appropriate icon for the stimuli type
  const getStimuliIcon = () => {
    switch (stimuliType) {
      case "image":
        return "📷";
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
    <div className="comparison-form">
      <h3>Add New Comparison</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="comparison-title">Comparison Title</label>
          <input
            type="text"
            id="comparison-title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this comparison"
            required
          />
        </div>

        <div className="form-group">
          <label>Comparison Type</label>
          <div className="comparison-type-selector">
            <div
              className={`comparison-type-option ${
                type === "binary" ? "active" : ""
              }`}
              onClick={() => setType("binary")}
            >
              Binary Comparison
            </div>
            <div
              className={`comparison-type-option ${
                type === "rating" ? "active" : ""
              }`}
              onClick={() => setType("rating")}
            >
              Rating Scale
            </div>
            <div
              className={`comparison-type-option ${
                type === "single-select" ? "active" : ""
              }`}
              onClick={() => setType("single-select")}
            >
              Single-select
            </div>
            <div
              className={`comparison-type-option ${
                type === "multiselect" ? "active" : ""
              }`}
              onClick={() => setType("multiselect")}
            >
              Multiselect
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Stimuli Type</label>
          <div className="stimuli-type-selector">
            <div
              className={`stimuli-type-option ${
                stimuliType === "image" ? "active" : ""
              }`}
              onClick={() => setStimuliType("image")}
            >
              <span className="stimuli-type-icon">📷</span>
              Image
            </div>
            <div
              className={`stimuli-type-option ${
                stimuliType === "video" ? "active" : ""
              }`}
              onClick={() => setStimuliType("video")}
            >
              <span className="stimuli-type-icon">🎬</span>
              Video
            </div>
            <div
              className={`stimuli-type-option ${
                stimuliType === "audio" ? "active" : ""
              }`}
              onClick={() => setStimuliType("audio")}
            >
              <span className="stimuli-type-icon">🔊</span>
              Audio
            </div>
            <div
              className={`stimuli-type-option ${
                stimuliType === "pdf" ? "active" : ""
              }`}
              onClick={() => setStimuliType("pdf")}
            >
              <span className="stimuli-type-icon">📄</span>
              PDF
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="stimuli-header">
            <label>
              Upload{" "}
              {stimuliType.charAt(0).toUpperCase() + stimuliType.slice(1)} Files
            </label>
            {stimuli.length < 5 && (
              <button
                type="button"
                className="add-stimulus-btn"
                onClick={addStimulus}
              >
                Add Stimulus
              </button>
            )}
          </div>


<div className="stimulus-upload-container">
  {stimuli.map((stimulus, index) => (

    <div key={stimulus.id} className="stimulus-item">
      <div className="stimulus-label-container">
        <div className="stimulus-label">
          Stimulus {String.fromCharCode(65 + index)}
        </div>
        {stimuli.length > 1 && (
          <button
            type="button"
            className="remove-stimulus-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeStimulus(stimulus.id);
            }}
            aria-label="Remove stimulus"
          >
            &times;
          </button>
        )}
      </div>

      <div
        className={`stimulus-upload ${
          stimulus.file || stimulus.preview ? "has-file" : ""
        } ${stimuliType}`}
        onClick={() => document.getElementById(stimulus.id).click()}
      >
        {(stimulus.file || stimulus.preview) ? (
          stimuliType === "image" && stimulus.preview ? (
            <img
              src={stimulus.preview}
              alt={`Stimulus ${String.fromCharCode(65 + index)} preview`}
              className="uploaded-image"
            />
          ) : (
            <div className="file-preview">
              <div className="file-preview-icon">{getStimuliIcon()}</div>
              <div className="file-preview-name">
                {stimulus.fileName || `Stimulus ${String.fromCharCode(65 + index)}`}
              </div>
            </div>
          )
        ) : (
          <>
            <div className="upload-icon">{getStimuliIcon()}</div>
            <div className="upload-text">Upload {stimuliType}</div>
          </>
        )}

        <input
          type="file"
          id={stimulus.id}
          accept={getAcceptAttribute()}
          onChange={(e) => handleStimulusChange(e, stimulus.id)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  ))}
</div>
        </div>

        {error && <div className="error-text">{error}</div>}

        <div className="btn-container">
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Comparison"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComparisonForm;
