import React, { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import Card from "../../components/Card/Card";
import "./StudyOverViewPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const StudyOverview = () => {
  const { data: fetchedData, loading, error } = useFetch(`${BASE_URL}/api/studies`);
  const [data, setData] = useState([]);

  // Sync fetched data to local state
  useEffect(() => {
    if (fetchedData) setData(fetchedData);
  }, [fetchedData]);

  // Delete study handler

  if (loading) return <p className="status-text">Loading studies...</p>;
  if (error) return <p className="status-text error">Failed to load studies. Please try again later.</p>;

  return (
    <div>
      <h1>Study Overview</h1>
      <div>All active studies</div>

      <div className="study-card-container">
        {data.map((study) => (
          <Card
            key={study._id}
            imageSrc={
              study?.coverImage
                ? `${BASE_URL}/api/files/${study.coverImage._id || study.coverImage}`
                : "/placeholder.jpg"
            }
            participate={true}
            showEdit={true}
            showDelete={true}
            studyId={study._id}
            title={study.name}
            description={study.description}
            status={study?.status}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyOverview;
