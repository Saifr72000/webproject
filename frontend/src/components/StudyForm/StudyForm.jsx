import React, { useState } from "react";
import "./StudyForm.css";

const StudyForm = ({ onSaveStudy, loading }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setError("Please select an image file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Study name is required");
      return;
    }

    if (!description.trim()) {
      setError("Study description is required");
      return;
    }

    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await onSaveStudy(formData);
    } catch (err) {
      setError("Failed to create study. Please try again.");
    }
  };

  return (
    <div className="study-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="study-name">Study Name</label>
          <input
            type="text"
            id="study-name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter study name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="study-description">Description</label>
          <textarea
            id="study-description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your study"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Cover Image</label>
          <div
            className={`image-upload-container ${
              previewUrl ? "has-image" : ""
            }`}
            onClick={() => document.getElementById("cover-image").click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Cover preview"
                className="uploaded-image"
              />
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  Click to upload a cover image (optional)
                </div>
              </>
            )}
            <input
              type="file"
              id="cover-image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        <div className="btn-container">
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating..." : "Save Study"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyForm;
