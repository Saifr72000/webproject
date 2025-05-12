import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
import "./StudyFrontPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const StudyFrontPage = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { postData, loading: postLoading, error: postError } = usePost();
  const {
    data: study,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(`${BASE_URL}/api/studies/${studyId}`);

  /* console.log(study); */

  const handleStartStudy = async () => {
    const sessionData = await postData(
      `${BASE_URL}/api/sessions/create-session/${studyId}`
    );
    /* console.log(sessionData); */

    if (sessionData) {
      const sessionId = sessionData.session;
      /* console.log("SessionId", sessionId); */
      navigate(`/study-session/${sessionId}`);
    } else {
      /* console.log("Failed to start study. Please try again."); */
    }
  };

  if (fetchLoading) {
    return (
      <div className="loading-container">Loading study information...</div>
    );
  }

  if (fetchError) {
    return (
      <div className="error-container">
        Error loading study. Please try again later.
      </div>
    );
  }

  return (
    <div className="study-front-container">
      <div className="study-card">
        {study?.coverImage && (
          <div className="cover-image-container">
            <img
              src={`${BASE_URL}/api/files/${study.coverImage}`}
              alt={study.title}
              className="cover-image"
            />
          </div>
        )}
        <div className="study-info">
          <h1 className="study-title">{study?.name}</h1>
          <p className="study-description">{study?.description}</p>

          <p className="study-comparisons">
            {study?.comparisons?.length || 0}{" "}
            {study?.comparisons?.length !== 1 ? "questions" : "question"}
          </p>

          <p className="study-author">
            By {study?.owner?.firstName} {study?.owner?.lastName}
          </p>
          <button
            className="participate-button"
            onClick={handleStartStudy}
            disabled={postLoading}
          >
            {postLoading ? "Starting..." : "Participate"}
          </button>
          {postError && (
  <p className="error-message">
    Error: {typeof postError === "string" ? postError : postError?.message || "Unknown error"}
  </p>
)}

        </div>
      </div>
    </div>
  );
};

export default StudyFrontPage;
