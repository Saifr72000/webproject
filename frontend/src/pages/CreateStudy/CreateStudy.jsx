import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudyForm from "../../components/StudyForm/StudyForm";
import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import "./CreateStudy.css";

const CreateStudy = () => {
  const navigate = useNavigate();

  // State
  const [study, setStudy] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [showComparisonForm, setShowComparisonForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create a new study
  const handleCreateStudy = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Example API call - replace with your actual implementation
      const response = await fetch(
        "http://localhost:2000/api/studies/register/study",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create study");
      }

      const data = await response.json();
      console.log(data);
      setStudy(data);
      setSuccess("Study created successfully! Now you can add comparisons.");

      // Fetch comparisons if study already existed and was just retrieved
      if (data.comparisons && data.comparisons.length > 0) {
        setComparisons(data.comparisons);
      }
    } catch (err) {
      setError(err.message || "Failed to create study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new comparison
  const handleAddComparison = async (formData) => {
    if (!study) {
      setError("Please create a study first before adding comparisons.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Example API call - replace with your actual implementation
      const response = await fetch(
        `http://localhost:2000/api/studies/${study._id}/comparisons`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create comparison");
      }

      const data = await response.json();
      setComparisons([...comparisons, data]);
      setShowComparisonForm(false);
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-study-container">
      <div className="create-study-header">
        <h1>Create New Study</h1>
      </div>

      {!study ? (
        // Step 1: Create the study
        <div className="create-study-form">
          <StudyForm onSaveStudy={handleCreateStudy} loading={loading} />
        </div>
      ) : (
        // Step 2: Add comparisons
        <>
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-text">{error}</div>}

          <div className="study-summary">
            <h2>{study.name}</h2>
            <p>{study.description}</p>
            {study.coverImage && (
              <img
                src={study.coverImage.url}
                alt="Study cover"
                className="study-cover-image"
              />
            )}
          </div>

          <div className="comparison-section">
            <div className="section-header">
              <h2>Study Comparisons</h2>
              {!showComparisonForm && (
                <button
                  className="primary-btn"
                  onClick={() => setShowComparisonForm(true)}
                >
                  Create Comparison
                </button>
              )}
            </div>

            {showComparisonForm ? (
              <div className="comparison-card">
                <ComparisonForm
                  studyId={study._id}
                  onSaveComparison={handleAddComparison}
                  onCancel={() => setShowComparisonForm(false)}
                  loading={loading}
                />
              </div>
            ) : null}

            <ComparisonList comparisons={comparisons} />
          </div>

          <div className="btn-container mt-4">
            <button
              className="primary-btn"
              onClick={() => navigate(`/studies/${study._id}`)}
            >
              Done - View Study
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateStudy;
