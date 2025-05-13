import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "./StudyCompletePage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const StudyCompletePage = () => {
  const { sessionId } = useParams();
  const [studyName, setStudyName] = useState("");

  // Fetch session data to get the study name
  const {
    data: sessionData,
    loading,
    error,
  } = useFetch(`${BASE_URL}/api/sessions/get-session/${sessionId}`);

  useEffect(() => {
    if (sessionData && sessionData.session && sessionData.session.study) {
      setStudyName(sessionData.session.study.name || "the research study");
    }
  }, [sessionData]);

  if (loading) {
    return (
      <div className="study-complete-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-complete-container">
        <div className="error-message">
          <h2>Something went wrong</h2>
          <p>
            We couldn't load the completion details. Please contact the study
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-complete-container">
      <div className="study-complete-card">
        <div className="completion-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="completion-title">Thank You!</h1>

        <p className="completion-message">
          Your responses for <span className="study-name">{studyName}</span>{" "}
          have been successfully submitted.
        </p>

        <p className="completion-details">
          Your participation helps advance research and we greatly appreciate
          your time and effort.
        </p>

        <div className="action-buttons">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
        </div>
      </div>

      <div className="contact-info">
        <p>
          If you have any questions about this study, please contact the
          research team.
        </p>
      </div>
    </div>
  );
};

export default StudyCompletePage;
