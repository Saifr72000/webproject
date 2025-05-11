import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "./useFetch";
import usePost from "./usePost";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const useStudySession = (sessionId) => {
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
  const [showDemographics, setShowDemographics] = useState(false);

  // Fetch session data
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useFetch(`${BASE_URL}/api/sessions/get-session/${sessionId}`);

  useEffect(() => {
    if (!sessionData) return;
    setSession(sessionData);
    setCurrentComparisonIndex(sessionData?.currentComparisonIndex || 0);

    // Fetch comparisons
    const fetchComparisons = async () => {
      try {
        setLoading(true);

        if (sessionData?.session?.study?.comparisons) {
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
            } catch (err) {
              console.error("Error in fetchComparisons:", err);
              setError(err.message);
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
  }, [sessionData, sessionId]);

  useEffect(() => {
    if (session && session.responses && comparisons.length > 0) {
      const currentComparison = comparisons[currentComparisonIndex];
      if (!currentComparison) return;

      // Find if this comparison has been answered
      const response = session?.responses.find(
        (r) => r.comparison === currentComparison._id
      );

      const hasAnswered = response ? true : false;

      if (!answerSubmitted || hasAnswered) {
        setAnswerSubmitted(hasAnswered);
      }

      // If already answered, find the selected option
      if (hasAnswered && response) {
        setSelectedOption(response?.selectedAnswer);
      } else if (!hasAnswered && !answerSubmitted) {
        setStartTime(Date.now());
      }
    }
  }, [currentComparisonIndex, session, comparisons, answerSubmitted]);

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!selectedOption) return;

    const currentComparison = comparisons[currentComparisonIndex];
    if (!currentComparison) return;

    // Prepare response data based on comparison type
    let responseData;

    switch (currentComparison.type) {
      case "binary":
        responseData = currentComparison.stimuli.map((stimulus) => ({
          stimulusId: stimulus._id,
          selected: stimulus._id === selectedOption,
        }));
        break;
      case "single-select":
        responseData = { stimulusId: selectedOption };
        break;
      case "multi-select":
        responseData = [{ stimulusId: selectedOption }];
        break;
      case "rating":
        responseData = currentComparison.stimuli.map((stimulus) => ({
          stimulusId: stimulus._id,
          rating: stimulus._id === selectedOption ? 5 : 0,
        }));
        break;
      default:
        responseData = { stimulusId: selectedOption };
    }

    // Save response
    const newResponses = [...responses];
    newResponses[currentComparisonIndex] = {
      comparisonId: currentComparison._id,
      response: responseData,
    };
    setResponses(newResponses);

    // Submit to API
    try {
      await postData(`${BASE_URL}/api/sessions/add-response/${sessionId}`, {
        comparisonId: currentComparison._id,
        responseData,
      });

      // Move to next question or show demographics
      if (currentComparisonIndex < comparisons.length - 1) {
        setCurrentComparisonIndex(currentComparisonIndex + 1);
        setSelectedOption(null);
      } else {
        setShowDemographics(true);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  // Handle demographics submission
  const handleDemographicsSubmit = async (demographicsData) => {
    try {
      await postData(
        `${BASE_URL}/api/sessions/complete-session/${sessionId}`,
        demographicsData
      );
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

  // Toggle demographics view
  const toggleDemographics = (show) => {
    setShowDemographics(show);
    if (!show) {
      setCurrentComparisonIndex(comparisons.length - 1);
    }
  };

  return {
    session,
    comparisons,
    currentComparison: comparisons[currentComparisonIndex],
    totalQuestions: comparisons.length,
    currentComparisonIndex,
    selectedOption,
    showDemographics,
    loading: loading || sessionLoading,
    error: error || sessionError,
    handleOptionSelect,
    handleSubmitAnswer,
    handlePreviousQuestion,
    handleDemographicsSubmit,
    toggleDemographics,
  };
};

export default useStudySession;
