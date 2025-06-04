import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ComparisonForm from "../../components/ComparisonForm/ComparisonForm";
import ComparisonList from "../../components/ComparisonList/ComparisonList";
import PreviewModal from "../../components/PreviewModal/PreviewModal";


import { getStudyById, publishStudy, deleteStudy } from "../../services/studyService";
import { checkSessionExists } from "../../services/sessionService";
import { addComparisonToStudy, deleteComparison } from "../../services/comparisonService";
import { updateComparison } from "../../services/comparisonService";


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
  const [comparisonToEdit, setComparisonToEdit] = useState(null);
  
  
const isEditable = study?.status !== "active";


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
    
  if (!isEditable) {
  alert("You cannot update comparisons in a published study.");
  return;
}
    setLoading(true);
    setError("");
    setSuccess("");

    try {
     const response = await addComparisonToStudy(studyId, formData);
     setComparisons((prev) => [...prev, response.comparison]);
      setShowComparisonForm(false);
      setSuccess("Comparison added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComparison = async (id) => {
      if (!isEditable) {
  alert("You cannot update comparisons in a published study.");
  return;
}
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
    if (study.status === "active") {
    alert("You cannot update comparisons from a published study.");
    return;
  }
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
      if (study.status === "active" && study.participantCount > 0) {
    alert("You cannot delete comparisons from a active study with participants study.");
    return;
  }
    if (study.status === "active") {
    alert("You cannot delete comparisons from a published study.");
    return;
  }
  const confirm = window.confirm("Are you sure you want to delete this study?");
  if (!confirm) return;

  try {
    await deleteStudy(studyId);
    alert("Study deleted.");
    navigate("/studies");
  } catch (err) {
    alert(err.message || "Failed to delete study.");
  }
};

const handleUpdateComparison = async (comparisonId, formData) => {
if (!isEditable) {
  alert("You cannot update comparisons in a published study.");
  return;
}
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    await updateComparison(comparisonId, formData);


    const updatedStudy = await getStudyById(studyId);
    setComparisons(updatedStudy.comparisons || []);

    setSuccess("Comparison updated successfully!");
    setShowComparisonForm(false);
    setComparisonToEdit(null);
  } catch (err) {
    console.error("Update failed:", err);
    setError(err.message || "Failed to update comparison.");
  } finally {
    setLoading(false);
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
          <span style={{ color: 'white' }}>+</span> Add Comparison
        </button>
        )}
        </div>

{showComparisonForm && isEditable && (
  <div className="comparison-card">
    <ComparisonForm
      studyId={studyId}
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
)}

<ComparisonList
  comparisons={comparisons}
  onPreview={(comparison) => setPreviewComparison(comparison.comparison || comparison)}

  onDelete={handleDeleteComparison}

onEdit={(comparison) => {
  if (study?.status === "active") {
    alert("You cannot update comparisons from a published study");
    return;
  }
  const transformed = {
    ...comparison,
    stimuli: (comparison.options || []).map((opt, index) => {
      const s = opt.stimulus;


const previewUrl = s?._id
  ? `${BASE_URL}/api/stimuli/${s._id}` 
  : null;

      const fileName =
        s?.originalname || s?.filename || `Stimulus ${index + 1}`;

      const originalId =
        typeof s === "string" ? s : s?._id?.toString();

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
}}

/>
      </div>

      <div className="btn-container mt-4">
        <button
          className="primary-btn"
          onClick={() => navigate(`/study-details/${study._id}`)}
        >
          View Study
        </button>

        {study.status !== "active" && (
          <button className="primary-btn" onClick={handlePublishStudy}>
            Publish Study
          </button>
        )}

        {!(study.status === "completed" || study.participantCount > 0 && study.status === "active") && (
          <button
            className="danger-btn"
            onClick={handleDeleteStudy}
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