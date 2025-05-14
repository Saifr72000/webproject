import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import PreviewModal from "../../components/PreviewModal/PreviewModal";


import { getStudyById, publishStudy, deleteStudy } from "../../services/studyService";
import { checkSessionExists } from "../../services/sessionService";
import { addComparisonToStudy, deleteComparison } from "../../services/comparisonService";

import "../EditStudy/EditStudyPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const EditStudyPage = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [previewComparison, setPreviewComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showComparisonForm, setShowComparisonForm] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);

  // Fetch study and session existence on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studyData = await getStudyById(studyId);
        setStudy(studyData);
        setComparisons(studyData.comparisons || []);

        const sessionRes = await checkSessionExists(studyId);
        setSessionExists(sessionRes.sessionExists);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId]);

  const handleAddComparison = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newComparison = await addComparisonToStudy(studyId, formData);
      setComparisons((prev) => [...prev, newComparison]);
      setShowComparisonForm(false);
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message);
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
      setError("Failed to delete comparison.");
    }
  };

  const handlePublishStudy = async () => {
    const confirm = window.confirm(
      "Publish study? You won't be able to edit it after."
    );
    if (!confirm) return;

    try {
      await publishStudy(studyId);
      setStudy((prev) => ({ ...prev, status: "active" }));
      setSuccess("Study published successfully!");
    } catch (err) {
      setError("Could not publish study.");
    }
  };

const handleDeleteStudy = async () => {
  const confirm = window.confirm("Are you sure you want to delete this study?");
  if (!confirm) return;

  try {
    await deleteStudy(studyId); // <== this calls your service
    alert("Study deleted.");
    navigate("/studies");
  } catch (err) {
    alert(err.message || "Failed to delete study.");
  }
};


  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-study-container">
      <div className="edit-study-header">
        <h1>Edit Study</h1>
      </div>

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
      </div>

      <div className="comparison-section">
        <div className="section-header">
          
          <h2>Comparisons</h2>
          {study.status !== "active" && (
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

        <ComparisonList
          comparisons={comparisons}
          onPreview={(comparison) => setPreviewComparison(comparison)}
          onDelete={handleDeleteComparison}
        />
      </div>

      <div className="btn-container mt-4">
        <button
          className="primary-btn"
          onClick={() => navigate(`/studies/${study._id}`)}
        >
          View Study
        </button>

        {study.status !== "active" && !sessionExists && (
          <button className="primary-btn" onClick={handlePublishStudy}>
            🚀 Publish Study
          </button>
        )}

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
