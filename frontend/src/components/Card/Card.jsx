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
  showEdit = false,
}) => {
  return (
    <div className="study-card">
      <div className="study-content">
        <div className="quiz-image">
          <img src={imageSrc} alt="" />
        </div>
        <div className="quiz-content-item">
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{author}</p>
        </div>

        <div className="card-buttons">
          {participate && (
            <Link to={`/study/${studyId}`}>
              <button className="secondary-btn">View Study</button>
            </Link>
          )}
          {showEdit && (
            <Link to={`/edit-study/${studyId}`}>
              <button className="primary-btn">Edit Study</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
