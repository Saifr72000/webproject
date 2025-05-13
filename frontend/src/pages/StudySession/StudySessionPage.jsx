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
  const [isPreviouslyAnswered, setIsPreviouslyAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]); // For multi-select
  const [ratings, setRatings] = useState({}); // For rating type
  const [binaryResponses, setBinaryResponses] = useState({}); // For binary type
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
      console.log("Fetching comparisons");
      try {
        setLoading(true);

        if (sessionData?.session?.study?.comparisons) {
          console.log(
            "Comparisons to fetch:",
            sessionData?.session?.study?.comparisons
          );
          // declaring an empty array to store the question objects fetched
          // from API call downwards
          const comparisonDetails = [];

          for (const comparisonId of sessionData?.session?.study?.comparisons) {
            try {
              console.log("Fetching comparison:", comparisonId);
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
              console.log("Loaded comparison data:", comparisonData);
            } catch (err) {
              console.error("Error in fetchComparisons:", err);
              setError(err.message);
              // Continue instead of throwing to prevent the whole process from failing
            }
          }

          if (comparisonDetails?.length > 0) {
            console.log("Setting comparisons:", comparisonDetails);
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
      const currentComparison = comparisons[currentComparisonIndex];
      if (!currentComparison) return;

      // Get correct comparison ID
      const comparisonId =
        currentComparison.comparison?._id || currentComparison._id;

      // Find if this comparison has been answered in the session data
      const response = session?.responses.find(
        (r) =>
          r.comparison === comparisonId ||
          r.comparison === currentComparison._id
      );

      const hasAnswered = response ? true : false;
      console.log(
        "Question answered status:",
        hasAnswered,
        "for comparison:",
        comparisonId
      );

      if (hasAnswered) {
        // The question has been answered in the session data
        setAnswerSubmitted(true);

        // If we're navigating back to this question (not the first time seeing it),
        // it's a previously answered question
        setIsPreviouslyAnswered(true);

        console.log("Restoring previous selections from response:", response);

        // Handle different comparison types when restoring previous responses
        const comparisonType =
          currentComparison.comparison?.type || "single-select";

        switch (comparisonType) {
          case "rating":
            // Restore ratings
            if (response.responseData && Array.isArray(response.responseData)) {
              const savedRatings = {};
              response.responseData.forEach((item) => {
                if (item.stimulusId && item.rating) {
                  savedRatings[item.stimulusId] = item.rating;
                }
              });
              console.log("Restored ratings:", savedRatings);
              setRatings(savedRatings);
            }
            break;

          case "binary":
            // Restore binary responses
            if (response.responseData && Array.isArray(response.responseData)) {
              const savedBinaryResponses = {};
              response.responseData.forEach((item) => {
                if (item.stimulusId !== undefined) {
                  savedBinaryResponses[item.stimulusId] = item.selected;
                }
              });
              console.log("Restored binary responses:", savedBinaryResponses);
              setBinaryResponses(savedBinaryResponses);
            }
            break;

          case "multi-select":
            // Restore multi-select options
            if (response.responseData && Array.isArray(response.responseData)) {
              const selectedIds = response.responseData
                .map((item) => item.stimulusId)
                .filter(Boolean);
              console.log("Restored multi-select options:", selectedIds);
              setSelectedOptions(selectedIds);
            }
            break;

          case "single-select":
          default:
            // Restore single-select option
            if (response.responseData && response.responseData.stimulusId) {
              console.log(
                "Restored single selection:",
                response.responseData.stimulusId
              );
              setSelectedOption(response.responseData.stimulusId);
            }
            break;
        }
      } else {
        // The question hasn't been answered yet
        setAnswerSubmitted(false);
        setIsPreviouslyAnswered(false);

        // Reset the start time
        setStartTime(Date.now());
      }
    }
  }, [currentComparisonIndex, session, comparisons]);

  // Get current comparison - this needs to be defined outside of useEffect so it's accessible throughout the component
  const currentComparison = comparisons[currentComparisonIndex];
  // Add debug logs
  useEffect(() => {
    if (currentComparison) {
      console.log("Current comparison:", currentComparison);
      console.log("Stimuli:", currentComparison.stimuli);
    }
  }, [currentComparison]);

  // defines the number of the comparisons
  const totalQuestions = comparisons.length;

  // Handle option selection based on comparison type
  const handleOptionSelect = (optionId) => {
    const comparisonType =
      currentComparison?.comparison?.type || "single-select";

    switch (comparisonType) {
      case "multi-select":
        // Toggle selection for multi-select
        if (selectedOptions.includes(optionId)) {
          setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
        } else {
          setSelectedOptions([...selectedOptions, optionId]);
        }
        break;

      case "single-select":
      default:
        // For single-select, we also have unselected state
        if (selectedOption === optionId) {
          setSelectedOption(null);
        } else {
          setSelectedOption(optionId);
        }
        break;
    }
  };

  // Handle rating change
  const handleRatingChange = (optionId, rating) => {
    setRatings({
      ...ratings,
      [optionId]: rating,
    });
  };

  // Handle binary response change
  const handleBinaryChange = (optionId, value) => {
    setBinaryResponses({
      ...binaryResponses,
      [optionId]: value,
    });
  };

  // Reset all selection states
  const resetSelections = () => {
    setSelectedOption(null);
    setSelectedOptions([]);
    setRatings({});
    setBinaryResponses({});
  };

  // Function to check if submit button should be disabled
  const isSubmitButtonDisabled = () => {
    // If this question is already answered, we don't disable the button for previously answered questions,
    // since we want the user to be able to navigate to the next question
    if (answerSubmitted && !isPreviouslyAnswered) return true;

    if (!currentComparison?.comparison?.options?.length) return true;

    const comparisonType =
      currentComparison.comparison?.type || "single-select";

    switch (comparisonType) {
      case "rating":
        // Check if all options have ratings
        return !currentComparison.comparison.options.every(
          (option) => ratings[option.stimulus._id] !== undefined
        );

      case "binary":
        // Check if all options have binary responses
        return !currentComparison.comparison.options.every(
          (option) => binaryResponses[option.stimulus._id] !== undefined
        );

      case "multi-select":
        // At least one option must be selected
        return selectedOptions.length === 0;

      case "single-select":
      default:
        // One option must be selected
        return !selectedOption;
    }
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!currentComparison) return;

    const comparisonType =
      currentComparison.comparison?.type || "single-select";

    // Validate that we have the required data for this comparison type
    let canSubmit = false;

    switch (comparisonType) {
      case "rating":
        // Check if all options have ratings
        const allOptionsRated = currentComparison.comparison.options.every(
          (option) => ratings[option.stimulus._id] !== undefined
        );
        canSubmit = allOptionsRated;
        break;

      case "binary":
        // Check if all options have binary responses
        const allOptionsAnswered = currentComparison.comparison.options.every(
          (option) => binaryResponses[option.stimulus._id] !== undefined
        );
        canSubmit = allOptionsAnswered;
        break;

      case "multi-select":
        // At least one option should be selected
        canSubmit = selectedOptions.length > 0;
        break;

      case "single-select":
      default:
        // One option must be selected
        canSubmit = !!selectedOption;
        break;
    }

    if (!canSubmit) {
      alert("Please complete all required selections before submitting.");
      return;
    }

    // Get the correct comparison ID - it might be nested in the comparison object
    const currentComparisonId =
      currentComparison.comparison?._id || currentComparison._id;
    console.log("Using comparison ID:", currentComparisonId);

    // Prepare response data based on comparison type
    let responseData;

    switch (comparisonType) {
      case "binary":
        responseData = currentComparison.comparison.options.map((option) => ({
          stimulusId: option.stimulus._id,
          selected: binaryResponses[option.stimulus._id] || false,
        }));
        break;

      case "rating":
        responseData = currentComparison.comparison.options.map((option) => ({
          stimulusId: option.stimulus._id,
          rating: ratings[option.stimulus._id] || 3, // Default to middle rating if missing
        }));
        break;

      case "multi-select":
        responseData = selectedOptions.map((optionId) => ({
          stimulusId: optionId,
        }));
        break;

      case "single-select":
      default:
        responseData = { stimulusId: selectedOption };
        break;
    }

    console.log("Sending response data:", responseData);

    // Save response locally
    const newResponses = [...responses];
    newResponses[currentComparisonIndex] = {
      comparisonId: currentComparisonId,
      responseData: responseData,
    };
    setResponses(newResponses);

    try {
      // Immediately mark the answer as submitted for better UX
      setAnswerSubmitted(true);
      // Don't show the "previously answered" message for a freshly submitted answer
      setIsPreviouslyAnswered(false);

      // Submit to API
      const updatedSession = await postData(
        `${BASE_URL}/api/sessions/add-response/${sessionId}`,
        {
          comparisonId: currentComparisonId,
          responseData,
        }
      );

      // Update session if we received a response
      if (updatedSession) {
        setSession(updatedSession);
      }

      // Check if we've reached the end of questions
      const newIndex = currentComparisonIndex + 1;
      if (newIndex >= totalQuestions) {
        console.log("End of questions reached, showing demographics");
        setShowDemographics(true);
      } else {
        // Move to next question
        setCurrentComparisonIndex(newIndex);
        // Reset selections for the next question
        resetSelections();
        // Reset submission states for the next question
        setAnswerSubmitted(false);
        setIsPreviouslyAnswered(false);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      // Revert submission states in case of error
      setAnswerSubmitted(false);
      setIsPreviouslyAnswered(false);
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
      // Move to previous question
      setCurrentComparisonIndex(currentComparisonIndex - 1);

      // Reset selection states - the useEffect will restore previous selections
      // from session data if question was answered
      resetSelections();
      setAnswerSubmitted(false);
      setIsPreviouslyAnswered(false);
    }
  };

  // Handle button click based on question state
  const handleButtonClick = () => {
    if (isPreviouslyAnswered) {
      // If this is a previously answered question, just go to the next question
      const newIndex = currentComparisonIndex + 1;
      if (newIndex >= totalQuestions) {
        // If we've reached the end, show demographics
        setShowDemographics(true);
      } else {
        // Otherwise, move to the next question
        setCurrentComparisonIndex(newIndex);
        resetSelections();
        setAnswerSubmitted(false);
        setIsPreviouslyAnswered(false);
      }
    } else {
      // If this is a new question, submit the answer
      handleSubmitAnswer();
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
            <h2 className="question-title">
              {currentComparison && currentComparison.comparison
                ? currentComparison.comparison.title
                : "Loading comparison..."}
            </h2>

            {/* Instruction text based on comparison type */}
            {currentComparison && currentComparison.comparison && (
              <div className="comparison-instructions">
                {(() => {
                  const comparisonType =
                    currentComparison.comparison?.type || "single-select";

                  switch (comparisonType) {
                    case "rating":
                      return "Please rate each option on a scale from 1 to 5.";

                    case "binary":
                      return "Please answer Yes or No for each option.";

                    case "multi-select":
                      return "Please select one or more options that best match the criteria.";

                    case "single-select":
                    default:
                      return "Please select the best option that matches the criteria.";
                  }
                })()}
              </div>
            )}

            {/* Only show the "already answered" message when viewing a previously answered question */}
            {isPreviouslyAnswered && (
              <div className="answer-status">
                <div className="answer-status-icon">
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
                <p>
                  You've already answered this question. Your previous selection
                  is shown below. Click "Next Question" to continue.
                </p>
              </div>
            )}

            {currentComparison &&
            currentComparison.comparison.options.length > 0 ? (
              <div
                className={`options-container ${
                  isPreviouslyAnswered ? "previously-answered" : ""
                }`}
              >
                {/* Mapping over the options array */}
                {currentComparison?.comparison?.options.map((option) => {
                  // Determine if this is a PDF based on mimetype or URL
                  const isPdf = option.stimulus.mimetype?.includes("pdf");

                  // Get the type, with special handling for PDFs
                  const mediaType = isPdf
                    ? "pdf"
                    : option.stimulus.mimetype
                    ? option.stimulus.mimetype.split("/")[0]
                    : option.stimulus.type || "image";

                  // Get the comparison type
                  const comparisonType = currentComparison.comparison?.type;

                  // Determine if this option is selected based on the comparison type
                  let isSelected = false;
                  if (comparisonType === "multi-select") {
                    isSelected = selectedOptions.includes(option.stimulus._id);
                  } else if (comparisonType === "single-select") {
                    isSelected = selectedOption === option.stimulus._id;
                  }

                  return (
                    <StudyOption
                      key={option.stimulus._id}
                      option={{
                        id: option.stimulus._id,
                        type: mediaType,
                        url: `${BASE_URL}/api/stimuli/${option.stimulus._id}`,
                        isPdf: isPdf,
                      }}
                      isSelected={isSelected}
                      onSelect={handleOptionSelect}
                      comparisonType={comparisonType}
                      ratingValue={ratings[option.stimulus._id] || 3}
                      onRatingChange={handleRatingChange}
                      binaryValue={binaryResponses[option.stimulus._id]}
                      onBinaryChange={handleBinaryChange}
                      showBinaryControls={true}
                      isAnswered={answerSubmitted}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="no-options-message">
                <p>
                  No options available for this comparison. Please contact the
                  study administrator.
                </p>
              </div>
            )}

            <div className="navigation-buttons">
              <button
                className="previous-button"
                onClick={handlePreviousQuestion}
                disabled={currentComparisonIndex === 0}
              >
                Previous
              </button>
              <button
                className={`submit-button ${
                  answerSubmitted || isPreviouslyAnswered ? "submitted" : ""
                }`}
                onClick={handleButtonClick}
                disabled={
                  // Only disable the button for unanswered questions that don't have a valid selection
                  !isPreviouslyAnswered && isSubmitButtonDisabled()
                }
              >
                {isPreviouslyAnswered
                  ? "Next Question"
                  : answerSubmitted
                  ? "Answer Submitted"
                  : "Submit Answer"}
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
