import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudyForm from "../../components/StudyForm/StudyForm";
import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import PreviewModal from "../../components/PreviewModal/PreviewModal";
import { deleteComparison, updateComparison } from "../../services/comparisonService";

import "./CreateStudy.css";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const CreateStudy = () => {
  const navigate = useNavigate();

  // State
  const [study, setStudy] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [showComparisonForm, setShowComparisonForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewComparison, setPreviewComparison] = useState(null);
  const [comparisonToEdit, setComparisonToEdit] = useState(null);

  const handleCreateStudy = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/api/studies/register/study`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create study");
      }

      const data = await response.json();
      setStudy(data);
      setSuccess("Study created successfully! Now you can add comparisons.");

      if (data.comparisons && data.comparisons.length > 0) {
        setComparisons(data.comparisons);
      }
    } catch (err) {
      setError(err.message || "Failed to create study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComparison = async (formData) => {
    if (!study) {
      setError("Please create a study first before adding comparisons.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${BASE_URL}/api/studies/${study._id}/comparisons`,
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
      setComparisons([...comparisons, data.comparison]);
      setShowComparisonForm(false);
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComparison = async (comparisonId, formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await updateComparison(comparisonId, formData);


      const response = await fetch(`${BASE_URL}/api/studies/${study._id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh study data");
      }

      const updatedStudy = await response.json();
      setComparisons(updatedStudy.comparisons || []);
      setComparisonToEdit(null);
      setShowComparisonForm(false);
      setPreviewComparison(null);
      setSuccess("Comparison updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.message || "Failed to update comparison.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComparison = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this comparison?");
    if (!confirm) return;

    try {
      await deleteComparison(id);
      setComparisons((prev) => prev.filter((c) => c._id !== id));
      setSuccess("Comparison deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.message || "Failed to delete comparison.");
    }
  };

  const handleEditComparison = (comparison) => {
    const transformed = {
      ...comparison,
      stimuli: (comparison.options || []).map((opt, index) => {
        const s = opt.stimulus;
        const previewUrl = s?._id
          ? `${BASE_URL}/api/stimuli/${s._id}`
          : null;

        const fileName =
          s?.originalname || s?.filename || `Stimulus ${index + 1}`;

        const originalId = typeof s === "string" ? s : s?._id?.toString();

        return {
          id: `stimulus-${index}`,
          file: null,
          preview: previewUrl,
          fileName,
          originalId,
          persisted: !!originalId,
        };
      }),
    };

    setComparisonToEdit(transformed);
    setShowComparisonForm(true);
  };

  return (
    <div className="create-study-container">
      <div className="create-study-header">
        <h1>Create New Study</h1>
      </div>

      {!study ? (
        <div className="create-study-form">
          <StudyForm onSaveStudy={handleCreateStudy} loading={loading} />
        </div>
      ) : (
        <>
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-text">{error}</div>}

          <div className="study-summary">
            <h2>{study.name}</h2>
            <p>{study.description}</p>
            {study.coverImage && (
              <img
                src={`${process.env.REACT_APP_BASE_URL}/api/stimuli/${study.coverImage}`}
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
                  onClick={() => {
                    setShowComparisonForm(true);
                    setComparisonToEdit(null);
                  }}
                >
                  Create Comparison
                </button>
              )}
            </div>

            {showComparisonForm ? (
              <div className="comparison-card">
                <ComparisonForm
                  studyId={study._id}
                  initialData={comparisonToEdit}
                  onSaveComparison={handleAddComparison}
                  onUpdateComparison={handleUpdateComparison}
                  onCancel={() => {
                    setShowComparisonForm(false);
                    setComparisonToEdit(null);
                  }}
                  loading={loading}
                />
              </div>
            ) : null}

            <ComparisonList
              comparisons={comparisons}
              onPreview={(comparison) =>
                setPreviewComparison(comparison.comparison || comparison)
              }
              onDelete={handleDeleteComparison}
              onEdit={handleEditComparison}
            />

            {previewComparison && (
              <PreviewModal
                comparison={previewComparison}
                onClose={() => setPreviewComparison(null)}
              />
            )}
          </div>

          <div className="btn-container mt-4">
            <button
              className="primary-btn"
              onClick={() => navigate(`/study-details/${study._id}`)}
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
