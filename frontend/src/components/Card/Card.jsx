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
}) => {
  return (
    <div className="study-card">
      <div className="study-content">
        <div className="quiz-image">
          <img src={imageSrc} alt={title} />
        </div>
        <div className="quiz-content-item">
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{author}</p>
        </div>

        {participate && (
          <div>
            <Link to={`/study-details/${studyId}`}>
              <button className="secondary-btn">View Study</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
