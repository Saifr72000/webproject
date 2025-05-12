import React from "react";
import "./previewModal.css";

const PreviewModal = ({ comparison, onClose }) => {
  if (!comparison) return null;
  console.log("Previewing comparison:", comparison);

  const options = comparison.options || [];

  return (
    <div className="preview-modal-container" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>x</button>
        <h2 className="preview-title">{comparison.title}</h2>
        <p className="preview-prompt">{comparison.prompt}</p>

        <div className="preview-files">
          {options.length > 0 ? (
            options.map((opt, index) => {
              // ✅ fallback for when stimulus is just an ID string
              const stimulusId = typeof opt.stimulus === "string"
                ? opt.stimulus
                : opt?.stimulus?._id;

              return (
                <div key={index} className="stimulus-preview">
                  <img
                    src={`${process.env.REACT_APP_BASE_URL}/api/files/${stimulusId}`}
                    alt={opt?.label || `Stimulus ${index + 1}`}
                    className="preview-image"
                  />
                </div>
              );
            })
          ) : (
            <p className="empty-message">No stimuli added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
