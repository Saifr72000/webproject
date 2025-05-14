import React from "react";
import "./Card.css";
import { Link } from "react-router-dom";

const Card = ({
  title,
  imageSrc,
  description,
  author,
  participate = false,
  studyId,
  status,
  showEditButton = false
}) => {
  return (
    <div className="study-card">
      <div className="study-content">
        <div className="quiz-image">
          <img src={imageSrc} alt="" />
        </div>
        <div className="quiz-content-item">
          {status && (
          <span className={`status-badge ${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{author}</p>
        </div>

{(participate || showEditButton) && (
  <div className="button-row">
    {participate && (
      <Link to={`/study/${studyId}`}>
        <button className="secondary-btn">View Study</button>
      </Link>
    )}
    {showEditButton && (
      <Link to={`/edit-study/${studyId}`}>
        <button className="edit-btn">Edit Study</button>
      </Link>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default Card;
