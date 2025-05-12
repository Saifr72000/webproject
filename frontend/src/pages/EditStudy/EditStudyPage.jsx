import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import "../CreateStudy/CreateStudy.css";
import PreviewModal from "../../components/previewModal/previewModal";

const BASE_URL = process.env.REACT_APP_BASE_URL; // base URL from environment variables

// state variables 
const EditStudyPage = () => { // this is the edit study page
  const [previewComparison, setPreviewComparison] = useState(null); // selected comparison to preview
  const { studyId } = useParams(); // get the studyId from the URL
  const navigate = useNavigate(); // navigate to another page
  const [study, setStudy] = useState(null); // study state
  const [comparisons, setComparisons] = useState([]); // comparisons state
  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(""); // error state
  const [success, setSuccess] = useState(""); // success state
  const [showComparisonForm, setShowComparisonForm] = useState(false); // show comparison form state
  const [sessionExists, setSessionExists] = useState(false); // tracks if a session exists for this study

  // fetch study data + check if any sessions exist for this study
  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/studies/${studyId}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("failed to fetch study");

        const data = await res.json();
        setStudy(data);
        setComparisons(data.comparisons || []); // fallback in case comparisons is undefined

        // Checks if a session exists for this study to prevent publishing/editing
        const sessionRes = await fetch(
          `${BASE_URL}/api/sessions/check-session-exists/${studyId}`
        );
        const sessionData = await sessionRes.json();
        setSessionExists(sessionData.sessionExists);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // always stop loading regardless of success/failure
      }
    };

    fetchStudy();
  }, [studyId]);

  // Add a new comparison
  const handleAddComparison = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${BASE_URL}/api/studies/${studyId}/comparisons`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to add comparison");

      const data = await response.json();
      setComparisons([...comparisons, data.comparison]); // append the new one to the list
      setShowComparisonForm(false); // hide form after successful save
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete the entire study
  const handleDeleteStudy = async () => {
    const confirm = window.confirm("Are you sure you want to delete this study?");
    if (!confirm) return;

    try {
      const res = await fetch(`${BASE_URL}/api/studies/${studyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete study");

      alert("Study deleted successfully.");
      navigate("/studies"); // redirect to study list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete study.");
    }
  };

  // publish the study (no more edits allowed after this)
  const handlePublishStudy = async () => {
    try {
      const confirm = window.confirm(
        "publish study? you wont be able to edit this study once published."
      );
      if (!confirm) return;

      const res = await fetch(`${BASE_URL}/api/studies/${studyId}/activate`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to publish study");

      await res.json();
      setStudy((prev) => ({ ...prev, status: "active" })); // update status locally
      setSuccess("Study published successfully!");
    } catch (err) {
      console.error(err);
      setError("Could not publish study.");
    }
  };


  if (loading) return <p>Loading...</p>;

  return (
    <div className="create-study-container">
      <div className="create-study-header">
        <h1>Edit Study</h1>
      </div>

      {/* error and success messages */}
      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="study-summary">
        <h2>{study.name}</h2>
        <p>{study.description}</p>
        {study.coverImage && (
          <img
            src={`${BASE_URL}/api/stimuli/${study.coverImage}`}
            alt="Study cover"
            className="study-cover-image"
          />
        )}
        <div style={{ marginTop: "1rem" }}></div>
      </div>


      <div className="comparison-section">
        <div className="section-header">
          <h2>Comparisons</h2>

          {/* Only show Add Comparison button if study is not active and no sessions exist */}
          {study.status !== "active" && !sessionExists && (
            <button
              className="primary-btn"
              onClick={() => setShowComparisonForm(true)}
            >
              ➕ Add Comparison
            </button>
          )}
        </div>


        {showComparisonForm && (
          <div className="comparison-card">
            <ComparisonForm
              studyId={studyId}
              onSaveComparison={handleAddComparison}
              onCancel={() => setShowComparisonForm(false)}
              loading={loading}
            />
          </div>
        )}

        {/* render list of existing comparisons */}
        <ComparisonList
          comparisons={comparisons}
          onPreview={(comparison) =>
            setPreviewComparison(comparison.comparison || comparison)
          }
          onDelete={async (id) => {
            try {
              const res = await fetch(`${BASE_URL}/api/comparisons/${id}`, {
                method: "DELETE",
                credentials: "include",
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.message) || "Failed to delete comparison";
              }

              setComparisons((prev) =>
                prev.filter((c) => c._id !== id)
              );
            } catch (error) {
              console.error(error);
              setError("Failed to delete comparison.");
            }
          }}
        />
      </div>

      
      <div className="btn-container mt-4">
        {/* Navigate to studies page */}
        <button
          className="primary-btn"
          onClick={() => navigate(`/studies/${study._id}`)}
        >
          View Study
        </button>

        {/* publish button only if not yet active and no sessions exist */}
        {study.status !== "active" && !sessionExists && (
          <button className="primary-btn" onClick={handlePublishStudy}>
            🚀 Publish Study
          </button>
        )}

        {/* delete button only if not completed and no participants yet */}
        {!(study.status === "completed" || study.participantCount > 0) && (
          <button
            className="danger-btn"
            onClick={handleDeleteStudy}
            style={{ marginLeft: "1rem" }}
          >
            Delete Study
          </button>
        )}
      </div>

      {/* Preview model of comparisons */}
      {previewComparison && (
        <PreviewModal
          comparison={previewComparison}
          onClose={() => setPreviewComparison(null)}
        />
      )}
    </div>
  );
};

export default EditStudyPage;
