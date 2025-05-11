import React from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const BASE_URL = process.env.REACT_APP_BASE_URL;
export const StudyCompletePage = () => {
  const { sessionId } = useParams();

  const {
    data: session,
    isLoading,
    error,
  } = useFetch(`${BASE_URL}/api/sessions/get-session/${sessionId}`);
  console.log(session);

  return <div>StudyCompletePage</div>;
};

export default StudyCompletePage;
