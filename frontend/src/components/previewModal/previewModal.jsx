import React from "react";
import "./previewModal.css";

const PreviewModal = ({ comparison, onClose}) => {
    if (!comparison) return null;

    return(
        <div className="preview-modal-container" onClick={onClose}>
            <div className = "preview-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>x</button>
                <h3>{comparison.title}</h3>
                <p>{comparison.prompt}</p>

                <div className="preview-files">
                    {comparison.options.map((opt, index) => (
                        <div key={index} className="stimulus-preview">
                            <img
                            src={`${process.env.REACT_APP_BASE_URL}/api/files/${opt.stimulus._id}`}
                            alt={opt.label || `Stimulus ${index + 1}`}
                            className="preview-image"
                            />
                        </div>
                    ))}
                </div>
        </div>
        </div>
    );
};

export default PreviewModal;
