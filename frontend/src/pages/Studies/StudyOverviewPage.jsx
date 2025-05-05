import React from "react";
import useFetch from "../../hooks/useFetch";
import Card from "../../components/Card/Card";
import "./StudyOverViewPage.css";

const StudyOverview = () => {
  const { data, loading, error } = useFetch(
    "http://localhost:2000/api/studies"
  );

  console.log(data);
  return (
    <div>
      <h1>Study Overview</h1>
      <div>All active studies</div>
      <div className="study-card-container">
        {data?.map((study) => {
          // Format author name safely
          /*  const authorName = study?.createdBy
            ? `${study.createdBy.firstName || ""} ${
                study.createdBy.lastName || ""
              }`.trim()
            : "Unknown Author";
 */
          return (
            <Card
              imageSrc={`http://localhost:2000/api/stimuli/${study?.coverImage}`}
              participate={true}
              studyId={study?._id}
              key={study?._id}
              title={study?.name}
              description={study?.description}
              /* author={authorName} */
            />
          );
        })}
      </div>
    </div>
  );
};

export default StudyOverview;
