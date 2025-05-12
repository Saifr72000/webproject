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
        console.log("Study object:", data)
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
      navigate("/studies");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete study.");
    }
  };


  const handlePublishStudy = async () => {
    try {
      const confirm = window.confirm("publish study? you wont be able to edit this study once published.");
      if (!confirm) return;
      const res = await fetch(`${BASE_URL}/api/studies/${studyId}/activate`, {
        method: "PATCH",
        credentials: "include",
      });
  
      if (!res.ok) throw new Error("Failed to publish study");
  
      await res.json();
      setStudy((prev) => ({ ...prev, status: "active" }));
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

      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="study-summary">
        <h2>{study.name}</h2>
        <p>{study.description}</p>
        {study.coverImage && (
          <img
          src={`${BASE_URL}/api/stimuli/${study.coverImage}`} alt="Study cover" className="study-cover-image" 
          />
        )}

        <div style ={{ marginTop: "1rem"}}>
        </div>
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
         onPreview={(comparison) => setPreviewComparison(comparison.comparison || comparison)}
          
         
         onDelete={async (id) => {
          try {
            const res = await fetch(`${BASE_URL}/api/comparisons/${id}`, {
              method: "DELETE",
              credentials: "include",
            });

            const data = await res.json();

            if (!res.ok){
               throw new Error(data.message) || "Failed to delete comparison";
            }

            setComparisons((prev) =>
              prev.filter((c) => c._id !== id)
            );
          } catch (error) {
            console.error(error);
            setError(
              "Failed to delete comparison.")
          }
        }}
      />
      </div>
      
      <div className="btn-container mt-4">

        <button
          className="primary-btn"
          onClick={() => navigate(`/studies/${study._id}`)}
        >
          View Study
        </button>

            {study.status !== "active" && (
              <button className="primary-btn" onClick={handlePublishStudy}>
                🚀 Publish Study
                </button>
              )}
              
            {!(study.status === "completed" || study.participantCount > 0) && (
            <button
            className="danger-btn"
            onClick={handleDeleteStudy}
            style={{ marginLeft: "1rem" }}
            > Delete Study 
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
