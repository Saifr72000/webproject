import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import "../CreateStudy/CreateStudy.css";
import PreviewModal from "../../components/previewModal/previewModal";



const BASE_URL = process.env.REACT_APP_BASE_URL;

const EditStudyPage = () => { // this is the edit study page
  const [previewComparison, setPreviewComparison] = useState(null);
  const { studyId } = useParams(); // get the studyId from the URL
  const navigate = useNavigate(); // navigate to another page
  const [study, setStudy] = useState(null); // study state
  const [comparisons, setComparisons] = useState([]); // comparisons state
  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(""); // error state
  const [success, setSuccess] = useState(""); // success state
  const [showComparisonForm, setShowComparisonForm] = useState(false); // show comparison form state

  // Fetch the study by ID
  useEffect(() => {
    const fetchStudy = async () => { // fetch study function
      try {
        const res = await fetch(`${BASE_URL}/api/studies/${studyId}`, { // fetch study by ID
          credentials: "include", // include cookies
        });

        if (!res.ok) throw new Error("Failed to fetch study"); // throw error

        const data = await res.json();
        setStudy(data);
        setComparisons(data.comparisons || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
      setComparisons([...comparisons, data.comparison]);
      setShowComparisonForm(false);
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="create-study-container">
      <div className="create-study-header">
        <h1>Edit Study</h1>
      </div>

      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="study-summary">
        <h2>{study.name}</h2>
        <p>{study.description}</p>
        {study.coverImage && (
          <img
          src={`${BASE_URL}/api/files/${study.coverImage._id}`} alt="Study cover" className="study-cover-image" />
        )}
      </div>

      <div className="comparison-section">
        <div className="section-header">
          <h2>Comparisons</h2>
            <button
              className="primary-btn"
              onClick={() => setShowComparisonForm(true)}
            >
              ➕ Add Comparison
            </button>
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

        <ComparisonList comparisons={comparisons}
        onPreview={(comparison) => setPreviewComparison(comparison)} />
      </div>

      <div className="btn-container mt-4">
        <button
          className="primary-btn"
          onClick={() => navigate(`/studies/${study._id}`)}
        >
          Done - View Study
        </button>
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
