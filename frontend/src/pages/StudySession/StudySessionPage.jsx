import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
import StudyStepper from "../../components/StudyStepper/StudyStepper";
import StudyOption from "../../components/StudyOption/StudyOption";
import DemographicsForm from "../../components/Demographics/DemographicsForm";
import "./StudySessionPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const StudySessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { postData } = usePost();

  const [session, setSession] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [demographics, setDemographics] = useState({
    gender: "",
    ageGroup: "",
    deviceType: "Desktop",
  });

  // Decides when to collect demographics from the participant
  const [showDemographics, setShowDemographics] = useState(false);

  // Fetch session data
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useFetch(`${BASE_URL}/api/sessions/get-session/${sessionId}`);
  console.log("Session data:", sessionData);

  useEffect(() => {
    if (!sessionData) return;
    setSession(sessionData);

    setCurrentComparisonIndex(
      sessionData?.session?.currentComparisonIndex || 0
    );

    // Fetch comparisons
    const fetchComparisons = async () => {
      /* console.log("Fetching comparisons"); */
      try {
        setLoading(true);

        if (sessionData?.session?.study?.comparisons) {
          /* console.log("Session data:", sessionData); */
          // declaring an empty array to store the question objects fetched
          // from API call downwards
          const comparisonDetails = [];

          for (const comparisonId of sessionData?.session?.study?.comparisons) {
            try {
              const response = await fetch(
                `${BASE_URL}/api/comparisons/${comparisonId}`
              );
              if (!response.ok) {
                console.error(
                  `Failed to fetch question ${comparisonId}: ${response.status}`
                );
                continue;
              }
              const comparisonData = await response.json();
              comparisonDetails.push(comparisonData);
              /* console.log("Comparison data:", comparisonData); */
            } catch (err) {
              console.error("Error in fetchComparisons:", err);
              setError(err.message);
              // Continue instead of throwing to prevent the whole process from failing
            }
          }

          if (comparisonDetails?.length > 0) {
            setComparisons(comparisonDetails);
          } else {
            setError("No valid comparisons could be loaded");
          }
        } else {
          setError("No comparisons found for this study");
        }

        setLoading(false);
        setStartTime(Date.now());
      } catch (err) {
        console.error("Error in fetchQuestions:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchComparisons();
  }, [sessionData, navigate, sessionId]);

  useEffect(() => {
    console.log("Effect running");
    if (session && session.responses && comparisons.length > 0) {
      const currentComparison = comparisons[currentComparisonIndex]; // assignes the specific question from the questions array to the currentQuestion variable
      if (!currentComparison) return;

      // Find if this comparison has been answered
      const response = session?.responses.find(
        (r) => r.comparison === currentComparison._id
      );

      const hasAnswered = response ? true : false;
      /* console.log("Question answered status:", hasAnswered); */

      // Only update if we're not already in an answered state
      // This prevents overriding the immediate feedback when submitting an answer
      if (!answerSubmitted || hasAnswered) {
        /* console.log("Setting answerSubmitted to:", hasAnswered); */
        setAnswerSubmitted(hasAnswered);
      }

      // If already answered, find the selected option
      if (hasAnswered && response) {
        /* console.log("Setting selectedOption to:", response.selectedAnswer); */
        setSelectedOption(response?.selectedAnswer);
      } else if (!hasAnswered && !answerSubmitted) {
        // Only reset the start time if we haven't already submitted an answer
        setStartTime(Date.now());
      }
    }
  }, [currentComparisonIndex, session, comparisons, answerSubmitted]);

  // Get current comparison - this needs to be defined outside of useEffect so it's accessible throughout the component
  const currentComparison = comparisons[currentComparisonIndex];
  const totalQuestions = comparisons.length;

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  // Handle submitting an answer
const handleSubmitAnswer = async () => {
  if (!selectedOption || !currentComparison) return;

  // Prepare response data based on comparison type
  let responseData;

  switch (currentComparison.type) {
case "binary":
  if (!currentComparison.options || !Array.isArray(currentComparison.options)) {
    console.error("Missing options for binary comparison:", currentComparison);
    return;
  }
  responseData = currentComparison.options.map((opt) => ({
    stimulusId: opt.stimulus._id,
    selected: opt.stimulus._id === selectedOption,
  }));
  break;

    case "single-select":
      responseData = { stimulusId: selectedOption };
      break;

    case "multi-select":
      responseData = [{ stimulusId: selectedOption }];
      break;

    case "rating":
      if (!currentComparison.stimuli) {
        console.error("Missing stimuli for rating comparison:", currentComparison);
        return;
      }
if (!currentComparison.options || !Array.isArray(currentComparison.options)) {
  console.error("Missing options for rating comparison:", currentComparison);
  return;
}
responseData = currentComparison.options.map((opt) => ({
  stimulusId: opt.stimulus._id,
  rating: opt.stimulus._id === selectedOption ? 5 : 0,
}));
      break;

    default:
      responseData = { stimulusId: selectedOption };
  }

  // Save response locally
  const newResponses = [...responses];
  newResponses[currentComparisonIndex] = {
    comparisonId: currentComparison._id,
    response: responseData,
  };
  setResponses(newResponses);

  try {
    const updatedSession = await postData(
      `${BASE_URL}/api/sessions/add-response/${sessionId}`,
      {
        comparisonId: currentComparison._id,
        responseData,
      }
    );

    if (updatedSession) {
      setSession(updatedSession);

      if (
        updatedSession.session &&
        updatedSession.session.currentComparisonIndex !== undefined
      ) {
        setCurrentComparisonIndex(
          updatedSession.session.currentComparisonIndex
        );
      } else if (currentComparisonIndex < totalQuestions - 1) {
        setCurrentComparisonIndex(currentComparisonIndex + 1);
      }

      setSelectedOption(null);

      if (currentComparisonIndex >= totalQuestions - 1) {
        setShowDemographics(true);
      }
    }
  } catch (error) {
    console.error("Error submitting response:", error);
  }
};


  // Add a function to handle demographics submission
  const handleDemographicsSubmit = async (demographicsData) => {
    try {
      // Just submit the demographics data, let server handle the session state
      await postData(
        `${BASE_URL}/api/sessions/complete-session/${sessionId}`,
        demographicsData
      );
      // Navigate to completion page after demographics are submitted
      navigate(`/study-complete/${sessionId}`);
    } catch (error) {
      console.error("Error submitting demographics:", error);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentComparisonIndex > 0) {
      setCurrentComparisonIndex(currentComparisonIndex - 1);
      setSelectedOption(
        responses[currentComparisonIndex - 1]?.response?.stimulusId || null
      );
    }
  };

  if (sessionLoading) {
    return <div className="loading-container">Loading study session...</div>;
  }

  if (sessionError || !session) {
    return (
      <div className="error-container">
        Error loading study session. Please try again.
      </div>
    );
  }

  return (
    <div className="study-session-container">
      <div className="study-session-card">
        <StudyStepper
          currentStep={
            showDemographics ? totalQuestions + 1 : currentComparisonIndex + 1
          }
          totalSteps={totalQuestions}
        />

        {!showDemographics ? (
          // Show question content
          <>
            <h2 className="question-title">{currentComparison?.title}</h2>
            <div className="options-container">
              {currentComparison?.options?.map((opt) => (
                <StudyOption
                key={opt.stimulus._id}
                option={{
                  id: opt.stimulus._id,
                  type: opt.stimulus.type || "image",
                  title: opt.label || opt.stimulus.title || "Option",
                }}
                isSelected={selectedOption === opt.stimulus._id}
                onSelect={handleOptionSelect}
                />
                ))}
              </div>

            <div className="navigation-buttons">
              <button
                className="previous-button"
                onClick={handlePreviousQuestion}
                disabled={currentComparisonIndex === 0}
              >
                Previous
              </button>
              <button
                className="submit-button"
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
              >
                Submit Answer
              </button>
            </div>
          </>
        ) : (
          // Show demographics form
          <DemographicsForm
            onSubmit={handleDemographicsSubmit}
            onBack={() => {
              setShowDemographics(false);
              setCurrentComparisonIndex(totalQuestions - 1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudySessionPage;
