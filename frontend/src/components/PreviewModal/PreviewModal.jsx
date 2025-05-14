import React from "react";
import "./PreviewModal.css";

const PreviewModal = ({ comparison, onClose }) => {
  if (!comparison) return null;

  if (!comparison.options || !Array.isArray(comparison.options)) {
    console.warn(" Invalid comparison passed to PreviewModal:", comparison);
    return (
      <div className="preview-modal">
        <p> Invalid comparison data. No options to preview.</p>
      </div>
    );
  }

  console.log("Previewing comparison:", comparison);
  const options = comparison.options || [];
  console.log("Options array received in modal:", options);

  return (
    <div className="preview-modal-container" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>x</button>
        <h2 className="preview-title">{comparison.title}</h2>
        <p className="preview-prompt">{comparison.prompt}</p>

        <div className="preview-files">
          {options.map((opt, index) => {
            const rawStimulus = opt.stimulus;
            console.log(` Option [${index}]`, opt);
            console.log(" Stimulus raw:", opt.stimulus);

            const stimulus = typeof rawStimulus === "string"
              ? { _id: rawStimulus, mimetype: "" }
              : rawStimulus || {};

            const stimulusId = stimulus._id || `fallback-${index}`;
            const src = `${process.env.REACT_APP_BASE_URL}/api/stimuli/${stimulusId}`;

            // Infer mimetype
            let mimetype = stimulus.mimetype || "";
            if (!mimetype && stimulus.filename) {
              const ext = stimulus.filename.split(".").pop().toLowerCase();
              if (ext === "mp4") mimetype = "video/mp4";
              else if (ext === "mp3") mimetype = "audio/mpeg";
              else if (ext === "pdf") mimetype = "application/pdf";
              else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                mimetype = `image/${ext === "jpg" ? "jpeg" : ext}`;
              }
            }

            // Use comparison.stimuliType as fallback
            if (!mimetype && comparison?.stimuliType) {
              const type = comparison.stimuliType.toLowerCase();
              if (type === "pdf") mimetype = "application/pdf";
              else if (type === "audio") mimetype = "audio/mpeg";
              else if (type === "video") mimetype = "video/mp4";
              else if (type === "image") mimetype = "image/jpeg";
            }

            const isPdf = mimetype.includes("pdf");
            const mediaType = isPdf
              ? "pdf"
              : mimetype
              ? mimetype.split("/")[0]
              : "unknown";

            console.log(`\n Stimulus [${index}]`);
            console.log("Stimulus object:", stimulus);
            console.log("Mimetype:", mimetype);
            console.log("MediaType:", mediaType);
            console.log("File URL:", src);

            const supportedTypes = ["image", "video", "audio", "pdf"];
            if (!supportedTypes.includes(mediaType)) {
              return (
                <div key={stimulusId} className="stimulus-preview">
                  <p>Unsupported file type: {mimetype || "unknown"}</p>
                </div>
              );
            }

            return (
              <div key={stimulusId} className="stimulus-preview">
                {mediaType === "image" && !isPdf && (
                  <img src={src} alt="" className="preview-image" />
                )}

                {mediaType === "video" && (
                  <video controls className="preview-media">
                    <source src={src} type={mimetype || "video/mp4"} />
                    Your browser does not support the video tag.
                  </video>
                )}

                {mediaType === "audio" && (
                <div style={{ marginBottom: "1rem", width: "100%" }}>
                <audio controls style={{ width: "100%" }}>
                <source src={src} type={mimetype || "audio/mpeg"} />
                Your browser does not support the audio element.
                </audio>
                </div>
                )}

          {isPdf && (
            <div className="study-option">
  <a
    href={src}
    target="_blank"
    rel="noopener noreferrer"
    className="pdf-container"
  >
    <object
      data={src}
      type="application/pdf"
      className="option-media pdf-frame"
    >
      <div className="pdf-fallback">
        <p>Your browser doesn't support embedded PDFs.</p>
        <span className="pdf-download-link">View PDF</span>
      </div>
    </object>
    <div className="pdf-overlay">
      <span>View PDF</span>
    </div>
  </a>
</div>
    )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
