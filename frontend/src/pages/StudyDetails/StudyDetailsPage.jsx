import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "./StudyDetailsPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;
const StudyDetailsPage = () => {
  const { studyId } = useParams();
  const [selectedDemographic, setSelectedDemographic] = useState("gender");
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [selectedComparisonTitle, setSelectedComparisonTitle] = useState("");
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
  });
  const [demographicData, setDemographicData] = useState({
    gender: {},
    ageGroup: {},
    educationLevel: {},
  });
  const [comparisonStats, setComparisonStats] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Fetch study data
  const {
    data: studyData,
    loading: studyLoading,
    error: studyError,
  } = useFetch(`${BASE_URL}/api/studies/${studyId}`);

  // Fetch session statistics
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useFetch(`${BASE_URL}/api/sessions/stats/${studyId}`);

  useEffect(() => {
    // Update session statistics when data is available
    if (sessionData) {
      // Log session data for debugging
      console.log("Session data received from API:", sessionData);
      console.log(
        "Comparison stats keys:",
        sessionData.comparisonStats
          ? Object.keys(sessionData.comparisonStats)
          : "No comparison stats"
      );

      setSessionStats({
        total: sessionData.totalSessions || 0,
        completed: sessionData.completedSessions || 0,
        incomplete: sessionData.incompleteSessions || 0,
      });

      if (sessionData.demographicData) {
        setDemographicData(sessionData.demographicData);
      }

      if (sessionData.comparisonStats) {
        setComparisonStats(sessionData.comparisonStats);
      }
    }
  }, [sessionData]);

  useEffect(() => {
    // Set the first comparison as selected when study data is loaded
    if (
      studyData &&
      studyData.comparisons &&
      studyData.comparisons.length > 0
    ) {
      setSelectedComparison(studyData.comparisons[0]._id);
    }
  }, [studyData]);

  // Handle demographic selection change
  const handleDemographicChange = (e) => {
    setSelectedDemographic(e.target.value);
  };

  // Handle comparison selection change
  const handleComparisonChange = (comparisonId) => {
    setSelectedComparison(comparisonId);

    // Update the comparison title for use in CSV exports and visualization headers
    const selectedComparisonObj = studyData?.comparisons?.find(
      (c) => c._id === comparisonId
    );
    setSelectedComparisonTitle(selectedComparisonObj?.title || "Comparison");
  };

  // Format demographic labels for better readability
  const formatDemographicLabel = (type, label) => {
    // Handle special cases first - check for undefined, null, empty string, and their string representations
    if (
      label === undefined ||
      label === null ||
      label === "" ||
      label === "undefined" ||
      label === "null" ||
      label === "Not Specified" ||
      label === "Undefined"
    ) {
      return "Not Specified";
    }

    switch (type) {
      case "gender":
        // Capitalize first letter: male -> Male
        return label.charAt(0).toUpperCase() + label.slice(1);

      case "ageGroup":
        // Format age ranges for better readability
        return label
          .replace("under-18", "Under 18")
          .replace("18-24", "18-24")
          .replace("25-34", "25-34")
          .replace("35-44", "35-44")
          .replace("45-54", "45-54")
          .replace("55-64", "55-64")
          .replace("65+", "65+");

      case "educationLevel":
        // Format education levels
        return label
          .replace("high-school", "High School")
          .replace("bachelors", "Bachelor's Degree")
          .replace("masters", "Master's Degree")
          .replace("phd", "PhD");

      default:
        return label;
    }
  };

  // Function to get overall demographic statistics
  const getOverallDemographicStats = () => {
    const selectedData = demographicData[selectedDemographic] || {};

    // Data is now pre-calculated from the backend, just format for display
    return Object.entries(selectedData)
      .map(([label, count]) => ({
        label: formatDemographicLabel(selectedDemographic, label),
        count: Number(count),
        percentage:
          sessionStats.completed > 0
            ? Math.round((Number(count) / sessionStats.completed) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };

  // Function to get statistics for a specific comparison
  const getComparisonStats = (comparisonId) => {
    if (!comparisonStats || !comparisonStats[comparisonId]) {
      return {
        responseCount: 0,
        demographicBreakdown: {},
        responseDistribution: {},
      };
    }

    const stats = comparisonStats[comparisonId];
    // Log the response distribution for debugging
    console.log("Response distribution for comparison:", comparisonId);
    console.log(
      "Distribution keys:",
      stats.responseDistribution
        ? Object.keys(stats.responseDistribution)
        : "No distribution data"
    );

    const selectedDemographicData =
      stats.demographicBreakdown?.[
        selectedDemographic === "ageGroup"
          ? "ageGroup"
          : selectedDemographic === "educationLevel"
          ? "educationLevel"
          : "gender"
      ] || {};

    // Get the comparison object to determine its type
    const comparison = studyData?.comparisons?.find(
      (c) => c._id === comparisonId
    );
    const comparisonType = comparison?.type || "single-select";

    // Data now comes pre-calculated from the backend, just format for display
    const total = Object.values(selectedDemographicData).reduce(
      (sum, count) => sum + Number(count),
      0
    );

    const formattedData = Object.entries(selectedDemographicData)
      .map(([label, count]) => ({
        label: formatDemographicLabel(selectedDemographic, label),
        count: Number(count),
        percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Response distribution is already calculated on the backend
    const responseDistribution = stats.responseDistribution || {};

    return {
      responseCount: stats.responseCount || 0,
      data: formattedData,
      comparisonType,
      responseDistribution,
    };
  };

  // Get column headers based on comparison type
  const getColumnHeaders = (comparisonType) => {
    switch (comparisonType) {
      case "binary":
        return ["Selected Yes", "Selected No"];
      case "rating":
        return ["Average Rating", "Rating Distribution (1-5)"];
      case "multi-select":
        return ["Most Selected Option", "Selection Count"];
      case "single-select":
      default:
        return ["Selected Option"];
    }
  };

  // Format response data based on comparison type
  const formatResponseData = (
    comparisonType,
    demographicKey,
    responseDistribution
  ) => {
    // Handle special case for 'all' demographic key
    if (demographicKey === "all") {
      const combinedData = {};

      // Combine data from all demographics
      Object.keys(responseDistribution || {}).forEach((key) => {
        const data = responseDistribution[key];

        if (comparisonType === "binary") {
          combinedData.yes = (combinedData.yes || 0) + (data.yes || 0);
          combinedData.no = (combinedData.no || 0) + (data.no || 0);
        } else if (comparisonType === "rating") {
          combinedData.ratings = combinedData.ratings || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
          if (data.ratings) {
            Object.keys(data.ratings).forEach((rating) => {
              combinedData.ratings[rating] =
                (combinedData.ratings[rating] || 0) +
                (data.ratings[rating] || 0);
            });
          }
          // Handle stimulus-specific ratings if they exist
          if (data.stimulusRatings) {
            combinedData.stimulusRatings = combinedData.stimulusRatings || {};
            Object.entries(data.stimulusRatings).forEach(
              ([stimulusId, ratingsObj]) => {
                combinedData.stimulusRatings[stimulusId] = combinedData
                  .stimulusRatings[stimulusId] || {
                  1: 0,
                  2: 0,
                  3: 0,
                  4: 0,
                  5: 0,
                };

                // Add ratings for this stimulus
                Object.entries(ratingsObj).forEach(([rating, count]) => {
                  combinedData.stimulusRatings[stimulusId][rating] =
                    (combinedData.stimulusRatings[stimulusId][rating] || 0) +
                    Number(count);
                });
              }
            );
          }
        } else if (comparisonType === "multi-select" && data.selections) {
          combinedData.selections = combinedData.selections || {};
          Object.keys(data.selections).forEach((option) => {
            combinedData.selections[option] =
              (combinedData.selections[option] || 0) +
              (data.selections[option] || 0);
          });
        } else if (comparisonType === "single-select" && data.selection) {
          combinedData.selection = combinedData.selection || {};
          Object.keys(data.selection).forEach((option) => {
            combinedData.selection[option] =
              (combinedData.selection[option] || 0) +
              (data.selection[option] || 0);
          });
        }
      });

      // Now process the combined data using the normal processing logic
      return processComparisonData(comparisonType, combinedData);
    }

    // Normalize the demographic key - handle all variations of undefined/null/empty
    const normalizedKey =
      demographicKey === undefined ||
      demographicKey === null ||
      demographicKey === "" ||
      demographicKey === "undefined" ||
      demographicKey === "null" ||
      demographicKey === "Undefined"
        ? "Not Specified"
        : demographicKey;

    // Log the normalized key and available keys for debugging
    console.log("Looking for demographic key:", normalizedKey);
    console.log(
      "Available keys in response distribution:",
      responseDistribution
        ? Object.keys(responseDistribution)
        : "No response distribution"
    );

    // Check if the demographic data exists for the normalized key
    if (!responseDistribution) {
      console.log("No response distribution data available");
      return { summary: "No data", details: null };
    }

    // Try multiple possible key formats
    let data;
    if (responseDistribution[normalizedKey]) {
      data = responseDistribution[normalizedKey];
    } else if (
      responseDistribution["Not Specified"] &&
      (normalizedKey === "Not Specified" ||
        normalizedKey === "undefined" ||
        normalizedKey === "null" ||
        normalizedKey === "Undefined")
    ) {
      data = responseDistribution["Not Specified"];
    } else {
      // Check for case-insensitive match
      const lowercaseKey = normalizedKey.toLowerCase();
      const matchingKey = Object.keys(responseDistribution).find(
        (key) => key.toLowerCase() === lowercaseKey
      );

      if (matchingKey) {
        data = responseDistribution[matchingKey];
      } else {
        console.log(`No data found for key "${normalizedKey}"`);
        return { summary: `No data for ${normalizedKey}`, details: null };
      }
    }

    return processComparisonData(comparisonType, data);
  };

  // Helper function to process comparison data based on type
  const processComparisonData = (comparisonType, data) => {
    if (!data) {
      return { summary: "No data", details: null };
    }

    switch (comparisonType) {
      case "binary":
        const yesCount = data.yes || 0;
        const noCount = data.no || 0;
        const total = yesCount + noCount;
        const yesPercentage =
          total > 0 ? Math.round((yesCount / total) * 100) : 0;

        return {
          summary: `${yesPercentage}% Yes, ${100 - yesPercentage}% No`,
          details: [
            { label: "Yes", count: yesCount, percentage: yesPercentage },
            { label: "No", count: noCount, percentage: 100 - yesPercentage },
          ],
        };

      case "rating":
        if (!data.ratings && !data.stimulusRatings)
          return { summary: "No ratings", details: null };

        // Check if we have the new stimulus-specific ratings format
        if (
          data.stimulusRatings &&
          Object.keys(data.stimulusRatings).length > 0
        ) {
          const stimuliRatings = [];
          let totalRatingsAcrossStimuli = 0;
          let weightedSumAcrossStimuli = 0;

          // Process each stimulus rating
          Object.entries(data.stimulusRatings).forEach(
            ([stimulusId, ratingCounts]) => {
              // Calculate total ratings for this stimulus
              const totalForStimulus = Object.entries(ratingCounts).reduce(
                (sum, [rating, count]) => sum + Number(count),
                0
              );

              // Calculate weighted sum for average
              const weightedSumForStimulus = Object.entries(
                ratingCounts
              ).reduce(
                (sum, [rating, count]) => sum + Number(rating) * Number(count),
                0
              );

              // Calculate average rating for this stimulus
              const averageForStimulus =
                totalForStimulus > 0
                  ? (weightedSumForStimulus / totalForStimulus).toFixed(1)
                  : "N/A";

              // Add to totals for overall average
              totalRatingsAcrossStimuli += totalForStimulus;
              weightedSumAcrossStimuli += weightedSumForStimulus;

              // Add detailed breakdown for this stimulus
              stimuliRatings.push({
                stimulusId,
                average: averageForStimulus,
                totalRatings: totalForStimulus,
                ratingDetails: Object.entries(ratingCounts)
                  .map(([rating, count]) => ({
                    rating: Number(rating),
                    count: Number(count),
                    percentage:
                      totalForStimulus > 0
                        ? Math.round((Number(count) / totalForStimulus) * 100)
                        : 0,
                  }))
                  .sort((a, b) => b.rating - a.rating),
              });
            }
          );

          // Sort by average rating (highest first)
          stimuliRatings.sort((a, b) => {
            if (a.average === "N/A") return 1;
            if (b.average === "N/A") return -1;
            return Number(b.average) - Number(a.average);
          });

          // Calculate overall average across all stimuli
          const overallAverage =
            totalRatingsAcrossStimuli > 0
              ? (weightedSumAcrossStimuli / totalRatingsAcrossStimuli).toFixed(
                  1
                )
              : "N/A";

          return {
            summary: `Avg: ${overallAverage}`,
            isPerStimulus: true,
            stimuliRatings,
            averageRating: overallAverage,
            // Include the aggregated ratings for backward compatibility
            details: data.ratings
              ? Object.entries(data.ratings)
                  .map(([rating, count]) => ({
                    label: `${rating} stars`,
                    count: Number(count),
                    percentage:
                      totalRatingsAcrossStimuli > 0
                        ? Math.round(
                            (Number(count) / totalRatingsAcrossStimuli) * 100
                          )
                        : 0,
                  }))
                  .sort(
                    (a, b) =>
                      Number(b.label.split(" ")[0]) -
                      Number(a.label.split(" ")[0])
                  )
              : [],
          };
        }

        // Fallback to the old format if no stimulus-specific data is available
        const ratings = data.ratings;
        const totalRatings = Object.values(ratings).reduce(
          (sum, count) => sum + Number(count),
          0
        );
        const weightedSum = Object.entries(ratings).reduce(
          (sum, [rating, count]) => sum + Number(rating) * Number(count),
          0
        );
        const average =
          totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : "N/A";

        return {
          summary: `Avg: ${average}`,
          details: Object.entries(ratings)
            .map(([rating, count]) => ({
              label: `${rating} stars`,
              count: Number(count),
              percentage:
                totalRatings > 0
                  ? Math.round((Number(count) / totalRatings) * 100)
                  : 0,
            }))
            .sort(
              (a, b) =>
                Number(b.label.split(" ")[0]) - Number(a.label.split(" ")[0])
            ),
        };

      case "multi-select":
        if (!data.selections)
          return { summary: "No selections", details: null };

        // Process all selections to show detailed distribution
        const selections = data.selections;
        const multiSelectTotalSelections = Object.values(selections).reduce(
          (sum, count) => sum + Number(count),
          0
        );

        // Sort selections by count in descending order
        const sortedSelections = Object.entries(selections)
          .map(([option, count]) => ({
            option,
            count: Number(count),
            percentage:
              multiSelectTotalSelections > 0
                ? Math.round((Number(count) / multiSelectTotalSelections) * 100)
                : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Generate a summary showing top 2 options and their percentages
        let summaryText = "";
        if (sortedSelections.length > 0) {
          // Include top option
          summaryText = `${sortedSelections[0].option} (${sortedSelections[0].percentage}%)`;

          // Include second option if available
          if (sortedSelections.length > 1) {
            summaryText += `, ${sortedSelections[1].option} (${sortedSelections[1].percentage}%)`;
          }

          // Add indication if there are more options
          if (sortedSelections.length > 2) {
            summaryText += ` + ${sortedSelections.length - 2} more`;
          }
        } else {
          summaryText = "No selections";
        }

        return {
          summary: summaryText,
          details: sortedSelections.map((item) => ({
            label: item.option,
            count: item.count,
            percentage: item.percentage,
          })),
          totalSelections: multiSelectTotalSelections,
        };

      case "single-select":
      default:
        if (!data.selection) return { summary: "No selection", details: null };

        const selectionCounts = data.selection;
        const totalSelections = Object.values(selectionCounts).reduce(
          (sum, count) => sum + Number(count),
          0
        );

        return {
          summary:
            Object.entries(selectionCounts)
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .map(([option, count]) => option)[0] || "None",
          details: Object.entries(selectionCounts)
            .map(([option, count]) => ({
              label: option,
              count: Number(count),
              percentage:
                totalSelections > 0
                  ? Math.round((Number(count) / totalSelections) * 100)
                  : 0,
            }))
            .sort((a, b) => b.count - a.count),
        };
    }
  };

  // Function to handle CSV export
  const handleExportCSV = () => {
    let csvContent, fileName;

    if (selectedComparison) {
      // Export data for the selected comparison
      const comparisonData = studyData.comparisons.find(
        (c) => c._id === selectedComparison
      );
      const stats = getComparisonStats(selectedComparison);

      csvContent = `Comparison: ${
        comparisonData?.title || selectedComparison
      }\n`;
      csvContent += `Demographic: ${selectedDemographic}\n`;
      csvContent += `Total Responses: ${stats.responseCount}\n\n`;

      csvContent += `${selectedDemographic},Count,Percentage\n`;
      stats.data.forEach((row) => {
        csvContent += `${row.label},${row.count},${row.percentage}%\n`;
      });

      fileName = `comparison_${selectedComparison}_${selectedDemographic}_stats.csv`;
    } else {
      // Export overall data
      const overallStats = getOverallDemographicStats();

      csvContent = `Study: ${studyData?.name || studyId}\n`;
      csvContent += `Demographic: ${selectedDemographic}\n`;
      csvContent += `Total Participants: ${sessionStats.completed}\n\n`;

      csvContent += `${selectedDemographic},Count,Percentage\n`;
      overallStats.forEach((row) => {
        csvContent += `${row.label},${row.count},${row.percentage}%\n`;
      });

      fileName = `study_${studyId}_${selectedDemographic}_stats.csv`;
    }

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to show demographic detail modal
  const showDemographicDetailModal = (
    comparisonType,
    demographicValue,
    data
  ) => {
    setModalData({
      comparisonType,
      demographicValue,
      data,
    });
    setShowDetailModal(true);
  };

  // Function to export stimulus data to CSV for detailed breakdowns
  const exportStimulusDataToCSV = (data, demographicValue) => {
    if (!data || !selectedComparisonTitle) return;

    let csvContent, fileName;

    // Create CSV content based on comparison type
    csvContent = `Comparison: ${selectedComparisonTitle}\n`;
    csvContent += `Demographic: ${demographicValue}\n\n`;

    if (data.details && data.details.length > 0) {
      csvContent += `Option,Count,Percentage\n`;
      data.details.forEach((item) => {
        csvContent += `${item.label},${item.count},${item.percentage}%\n`;
      });
    } else {
      csvContent += "No data available";
    }

    // Generate a descriptive file name
    fileName = `${selectedComparisonTitle.replace(
      /\s+/g,
      "_"
    )}_${demographicValue}_details.csv`;

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (studyLoading || sessionLoading) {
    return <div className="loading-container">Loading study details...</div>;
  }

  if (studyError || sessionError) {
    return (
      <div className="error-container">
        Error loading study details. Please try again.
      </div>
    );
  }

  const overallDemographicStats = getOverallDemographicStats();
  const selectedComparisonStats = selectedComparison
    ? getComparisonStats(selectedComparison)
    : null;

  return (
    <div className="study-details-container">
      <div className="page-navigation">
        <Link to="/studies" className="back-button">
          ← Back to Studies
        </Link>
      </div>

      {/* Study Overview Section */}
      <section className="study-overview-section">
        <div className="study-header">
          <h1>{studyData?.name}</h1>
          <p className="study-description">{studyData?.description}</p>
          {studyData?.status === "active" ? (
            <p className="study-description">
              Study url:{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${FRONTEND_URL}/study/${studyData?._id}`}
              >
                {`${FRONTEND_URL}/study/${studyData?._id}`}
              </a>
            </p>
          ) : studyData?.status === "draft" ? (
            <p
              className="study-description"
              style={{ fontStyle: "italic", color: "gray" }}
            >
              Publish the study from the{" "}
              <Link
                to={`/edit-study/${studyData._id}`}
                style={{ color: "#007BFF" }}
              >
                edit page
              </Link>{" "}
              before sharing the URL.
            </p>
          ) : studyData?.status === "completed" ? (
            <p
              className="study-description"
              style={{ fontStyle: "italic", color: "gray" }}
            >
              This study is completed and is no longer accepting responses.
            </p>
          ) : null}
        </div>

        <div className="study-stats-summary">
          <div className="study-stat-card">
            <h3>Comparisons</h3>
            <div className="stat-number">
              {studyData?.comparisons?.length || 0}
            </div>
          </div>
          <div className="study-stat-card">
            <h3>Total Participants</h3>
            <div className="stat-number">{sessionStats.total}</div>
          </div>
          <div className="study-stat-card">
            <h3>Completed Sessions</h3>
            <div className="stat-number">{sessionStats.completed}</div>
          </div>
          <div className="study-stat-card">
            <h3>Incomplete Sessions</h3>
            <div className="stat-number">{sessionStats.incomplete}</div>
          </div>
        </div>

        {studyData?.coverImage && (
          <div className="study-cover-image">
            <img
              src={`${BASE_URL}/api/stimuli/${studyData.coverImage}`}
              alt={studyData.name}
            />
          </div>
        )}
      </section>

      {/* Statistics Section */}
      <section className="study-statistics-section">
        <h2>Response Statistics</h2>

        {/* Controls for statistics display */}
        <div className="statistics-controls">
          <div className="control-group">
            <label htmlFor="demographic-select">View by demographic:</label>
            <select
              id="demographic-select"
              value={selectedDemographic}
              onChange={handleDemographicChange}
            >
              <option value="gender">Gender</option>
              <option value="ageGroup">Age Group</option>
              <option value="educationLevel">Education Level</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="comparison-select">View data for:</label>
            <select
              id="comparison-select"
              value={selectedComparison || "overall"}
              onChange={(e) =>
                e.target.value === "overall"
                  ? setSelectedComparison(null)
                  : handleComparisonChange(e.target.value)
              }
            >
              <option value="overall">Overall Study</option>
              {studyData?.comparisons?.map((comparison) => (
                <option key={comparison._id} value={comparison._id}>
                  {comparison.title}
                </option>
              ))}
            </select>
          </div>

          <button className="export-csv-button" onClick={handleExportCSV}>
            Export as CSV
          </button>
        </div>

        {/* Statistics display - HTML table */}
        <div className="statistics-container">
          {sessionStats.completed > 0 ? (
            <>
              {/* Overall demographic stats when no comparison is selected */}
              {!selectedComparison && (
                <>
                  <h3>
                    Overall{" "}
                    {selectedDemographic === "ageGroup"
                      ? "Age Group"
                      : selectedDemographic === "educationLevel"
                      ? "Education Level"
                      : "Gender"}
                    Distribution
                  </h3>

                  <div className="table-responsive">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>
                            {selectedDemographic === "ageGroup"
                              ? "Age Range"
                              : selectedDemographic === "educationLevel"
                              ? "Education Level"
                              : "Gender"}
                          </th>
                          <th>Count</th>
                          <th>Percentage</th>
                          <th>Visualization</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overallDemographicStats.length > 0 ? (
                          overallDemographicStats.map((row, index) => (
                            <tr key={index}>
                              <td>{row.label}</td>
                              <td>{row.count}</td>
                              <td>{row.percentage}%</td>
                              <td>
                                <div className="bar-visualization">
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${row.percentage}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4">No demographic data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Binary comparison specific display */}
              {selectedComparison &&
                selectedComparisonStats &&
                selectedComparisonStats.comparisonType === "binary" && (
                  <>
                    <h3>
                      Binary Responses for "
                      {studyData?.comparisons?.find(
                        (c) => c._id === selectedComparison
                      )?.title || "Comparison"}
                      " by{" "}
                      {selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"}
                    </h3>

                    <div className="table-responsive">
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Demographic Group</th>
                            <th>Yes</th>
                            <th>No</th>
                            <th>% Yes</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComparisonStats.data.length > 0 ? (
                            selectedComparisonStats.data.map((row, index) => {
                              // Get detailed response data for this demographic group
                              const responseData = formatResponseData(
                                "binary",
                                row.label,
                                selectedComparisonStats.responseDistribution
                              );

                              // Log the response data for debugging
                              console.log(
                                `Binary data for "${row.label}":`,
                                responseData
                              );

                              // Calculate Yes/No counts and percentages
                              const yesCount =
                                responseData && responseData.details
                                  ? responseData.details.find(
                                      (d) => d.label === "Yes"
                                    )?.count || 0
                                  : 0;
                              const noCount =
                                responseData && responseData.details
                                  ? responseData.details.find(
                                      (d) => d.label === "No"
                                    )?.count || 0
                                  : 0;
                              const totalCount = yesCount + noCount;
                              const yesPercentage =
                                totalCount > 0
                                  ? Math.round((yesCount / totalCount) * 100)
                                  : 0;

                              return (
                                <tr key={index}>
                                  <td>{row.label}</td>
                                  <td>{yesCount}</td>
                                  <td>{noCount}</td>
                                  <td>{yesPercentage}%</td>
                                  <td>{totalCount}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="5">
                                No response data available for this comparison
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              {/* Rating comparison specific display */}
              {selectedComparison &&
                selectedComparisonStats &&
                selectedComparisonStats.comparisonType === "rating" && (
                  <>
                    <h3>
                      Rating Responses for "
                      {studyData?.comparisons?.find(
                        (c) => c._id === selectedComparison
                      )?.title || "Comparison"}
                      " by{" "}
                      {selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"}
                    </h3>

                    <div className="table-responsive">
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Demographic Group</th>
                            <th>Average Rating</th>
                            <th>5★</th>
                            <th>4★</th>
                            <th>3★</th>
                            <th>2★</th>
                            <th>1★</th>
                            <th>Total Ratings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComparisonStats.data.length > 0 ? (
                            selectedComparisonStats.data.map((row, index) => {
                              // Get detailed response data for this demographic group
                              const responseData = formatResponseData(
                                "rating",
                                row.label,
                                selectedComparisonStats.responseDistribution
                              );

                              // Extract rating details
                              const ratingCounts = {};
                              let totalRatings = 0;
                              let weightedSum = 0;

                              if (responseData.details) {
                                responseData.details.forEach((detail) => {
                                  const rating = parseInt(
                                    detail.label.split(" ")[0]
                                  );
                                  ratingCounts[rating] = detail.count;
                                  totalRatings += detail.count;
                                  weightedSum += rating * detail.count;
                                });
                              }

                              const avgRating =
                                totalRatings > 0
                                  ? (weightedSum / totalRatings).toFixed(1)
                                  : "N/A";

                              return (
                                <tr key={index}>
                                  <td>{row.label}</td>
                                  <td>{avgRating}</td>
                                  <td>{ratingCounts[5] || 0}</td>
                                  <td>{ratingCounts[4] || 0}</td>
                                  <td>{ratingCounts[3] || 0}</td>
                                  <td>{ratingCounts[2] || 0}</td>
                                  <td>{ratingCounts[1] || 0}</td>
                                  <td>{totalRatings}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8">
                                No response data available for this comparison
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              {/* Single-select comparison specific display */}
              {selectedComparison &&
                selectedComparisonStats &&
                selectedComparisonStats.comparisonType === "single-select" && (
                  <>
                    <h3>
                      Single-Select Responses for "
                      {studyData?.comparisons?.find(
                        (c) => c._id === selectedComparison
                      )?.title || "Comparison"}
                      " by{" "}
                      {selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"}
                    </h3>

                    <div className="comparison-selection-info">
                      <p>
                        For single-select comparisons, visualization with
                        stimuli thumbnails is available below the table.
                      </p>
                    </div>

                    <div className="table-responsive">
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Demographic Group</th>
                            <th>Most Selected Option</th>
                            <th>Selection %</th>
                            <th>Total Responses</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComparisonStats.data.length > 0 ? (
                            selectedComparisonStats.data.map((row, index) => {
                              // Get detailed response data for this demographic group
                              const responseData = formatResponseData(
                                "single-select",
                                row.label,
                                selectedComparisonStats.responseDistribution
                              );

                              let topOption = "None";
                              let topPercentage = 0;
                              let totalSelections = 0;

                              if (
                                responseData.details &&
                                responseData.details.length > 0
                              ) {
                                topOption = responseData.details[0].label;
                                topPercentage =
                                  responseData.details[0].percentage;
                                totalSelections = responseData.details.reduce(
                                  (sum, d) => sum + d.count,
                                  0
                                );
                              }

                              return (
                                <tr key={index}>
                                  <td>{row.label}</td>
                                  <td>{topOption}</td>
                                  <td>{topPercentage}%</td>
                                  <td>{totalSelections}</td>
                                  <td>
                                    <button
                                      className="view-details-button"
                                      onClick={() => {
                                        const detailedData = formatResponseData(
                                          "single-select",
                                          row.label,
                                          selectedComparisonStats.responseDistribution
                                        );
                                        showDemographicDetailModal(
                                          "single-select",
                                          row.label,
                                          detailedData
                                        );
                                      }}
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="5">
                                No response data available for this comparison
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              {/* Multi-select comparison specific display */}
              {selectedComparison &&
                selectedComparisonStats &&
                selectedComparisonStats.comparisonType === "multi-select" && (
                  <>
                    <h3>
                      Multi-Select Responses for "
                      {studyData?.comparisons?.find(
                        (c) => c._id === selectedComparison
                      )?.title || "Comparison"}
                      " by{" "}
                      {selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"}
                    </h3>

                    <div className="comparison-selection-info">
                      <p>
                        For multi-select comparisons, detailed option selection
                        statistics with stimuli thumbnails are available below
                        the table.
                      </p>
                    </div>

                    <div className="table-responsive">
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Demographic Group</th>
                            <th>Top Selected Options</th>
                            <th>Total Selections</th>
                            <th>Selection Distribution</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComparisonStats.data.length > 0 ? (
                            selectedComparisonStats.data.map((row, index) => {
                              // Get detailed response data for this demographic group
                              const responseData = formatResponseData(
                                "multi-select",
                                row.label,
                                selectedComparisonStats.responseDistribution
                              );

                              let totalSelections = 0;
                              let distributionText = "No data";

                              if (
                                responseData.details &&
                                responseData.details.length > 0
                              ) {
                                totalSelections =
                                  responseData.totalSelections ||
                                  responseData.details.reduce(
                                    (sum, d) => sum + d.count,
                                    0
                                  );

                                // Create a visual representation of the distribution
                                const topThree = responseData.details.slice(
                                  0,
                                  3
                                );
                                distributionText = topThree
                                  .map(
                                    (option) =>
                                      `${
                                        option.label.length > 15
                                          ? option.label.substring(0, 15) +
                                            "..."
                                          : option.label
                                      } (${option.percentage}%)`
                                  )
                                  .join(", ");

                                if (responseData.details.length > 3) {
                                  distributionText += ` + ${
                                    responseData.details.length - 3
                                  } more`;
                                }
                              }

                              return (
                                <tr key={index}>
                                  <td>{row.label}</td>
                                  <td>{responseData.summary}</td>
                                  <td>{totalSelections}</td>
                                  <td className="distribution-cell">
                                    {distributionText}
                                  </td>
                                  <td>
                                    <button
                                      className="view-details-button"
                                      onClick={() => {
                                        const detailedData = formatResponseData(
                                          "multi-select",
                                          row.label,
                                          selectedComparisonStats.responseDistribution
                                        );
                                        showDemographicDetailModal(
                                          "multi-select",
                                          row.label,
                                          detailedData
                                        );
                                      }}
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="5">
                                No response data available for this comparison
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              {/* Response distribution for the selected comparison */}
              {selectedComparison &&
                selectedComparisonStats.responseCount > 0 && (
                  <div className="response-distribution">
                    <h4>Response Distribution</h4>

                    <p className="response-count">
                      Total responses:{" "}
                      <strong>{selectedComparisonStats.responseCount}</strong>
                    </p>

                    {/* Stimulus-specific response visualization */}
                    <StimulusVisualization
                      comparisonType={selectedComparisonStats.comparisonType}
                      responseData={
                        selectedComparisonStats.responseDistribution
                          ? formatResponseData(
                              selectedComparisonStats.comparisonType,
                              "all", // Using 'all' to indicate we want all demographic data
                              selectedComparisonStats.responseDistribution
                            )
                          : {}
                      }
                      comparisonTitle={selectedComparisonTitle}
                      exportStimulusDataToCSV={exportStimulusDataToCSV}
                    />
                  </div>
                )}
            </>
          ) : (
            <div className="no-data-message">
              <p>
                No completed sessions yet. Statistics will be available once
                participants complete the study.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Details Section */}
      <section className="study-comparisons-section">
        <h2>Study Comparisons</h2>
        {studyData?.comparisons?.length > 0 ? (
          <div className="comparisons-list">
            {studyData.comparisons.map((comparison, index) => (
              <div
                key={comparison._id}
                className={`comparison-card ${
                  selectedComparison === comparison._id ? "selected" : ""
                }`}
                onClick={() => handleComparisonChange(comparison._id)}
              >
                <h3>
                  Comparison {index + 1}: {comparison.title}
                </h3>
                <p>{comparison.description}</p>
                <p>Type: {comparison.type}</p>
                <div className="comparison-stats">
                  <span className="response-tag">
                    {comparisonStats[comparison._id]?.responseCount || 0}{" "}
                    responses
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No comparisons found for this study.</p>
        )}
      </section>

      {/* Add the DemographicDetailModal at the end */}
      <DemographicDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        data={modalData?.data}
        demographicValue={modalData?.demographicValue}
        comparisonType={modalData?.comparisonType}
        comparisonTitle={selectedComparisonTitle}
        exportStimulusDataToCSV={exportStimulusDataToCSV}
      />
    </div>
  );
};

// StimulusVisualization Component
const StimulusVisualization = ({
  comparisonType,
  responseData,
  comparisonTitle,
  exportStimulusDataToCSV,
}) => {
  if (!responseData || !responseData.details) {
    return (
      <div className="no-data-message">No detailed response data available</div>
    );
  }

  return (
    <div className="stimulus-visualization-container">
      <div className="visualization-header">
        <h3>{comparisonTitle} - Response Details</h3>
        <button
          className="export-button"
          onClick={() => exportStimulusDataToCSV(responseData, "all")}
        >
          Export Data
        </button>
      </div>

      {comparisonType === "binary" && (
        <div className="binary-visualization">
          <div className="binary-summary">
            <div className="summary-item">
              <span className="summary-label">Yes Responses:</span>
              <span className="summary-value">
                {responseData.details.find((d) => d.label === "Yes")
                  ?.percentage || 0}
                %
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">No Responses:</span>
              <span className="summary-value">
                {responseData.details.find((d) => d.label === "No")
                  ?.percentage || 0}
                %
              </span>
            </div>
          </div>

          <div className="binary-bar">
            <div
              className="yes-portion"
              style={{
                width: `${
                  responseData.details.find((d) => d.label === "Yes")
                    ?.percentage || 0
                }%`,
              }}
            >
              Yes (
              {responseData.details.find((d) => d.label === "Yes")?.count || 0})
            </div>
            <div
              className="no-portion"
              style={{
                width: `${
                  responseData.details.find((d) => d.label === "No")
                    ?.percentage || 0
                }%`,
              }}
            >
              No (
              {responseData.details.find((d) => d.label === "No")?.count || 0})
            </div>
          </div>
        </div>
      )}

      {comparisonType === "rating" && (
        <div className="rating-visualization">
          <div className="rating-summary">
            <div className="summary-item">
              <span className="summary-label">Average Rating:</span>
              <span className="summary-value">
                {responseData.averageRating ||
                  (responseData.details && responseData.details.length > 0
                    ? (
                        responseData.details.reduce((sum, item) => {
                          const rating = parseInt(item.label);
                          return sum + rating * item.count;
                        }, 0) /
                        responseData.details.reduce(
                          (sum, item) => sum + item.count,
                          0
                        )
                      ).toFixed(1)
                    : "N/A")}
              </span>
            </div>
          </div>

          {/* If we have per-stimulus data, render each stimulus with its ratings */}
          {responseData.isPerStimulus && responseData.stimuliRatings ? (
            <div className="stimuli-ratings-container">
              <div className="stimuli-ratings-title">
                Ratings by Stimulus ID
              </div>
              {responseData.stimuliRatings.map((stimulusRating, index) => (
                <div
                  key={stimulusRating.stimulusId}
                  className="stimulus-rating-card"
                >
                  <div className="stimulus-rating-header">
                    <span className="stimulus-id">
                      {stimulusRating.stimulusId}
                    </span>
                    <span className="stimulus-average">
                      Average: <strong>{stimulusRating.average}</strong>
                    </span>
                    <span className="stimulus-total">
                      Total ratings: {stimulusRating.totalRatings}
                    </span>
                  </div>
                  <div className="stimulus-rating-bars">
                    {[5, 4, 3, 2, 1].map((ratingValue) => {
                      const ratingData = stimulusRating.ratingDetails.find(
                        (d) => d.rating === ratingValue
                      );
                      const count = ratingData?.count || 0;
                      const percentage = ratingData?.percentage || 0;

                      return (
                        <div key={ratingValue} className="rating-bar-item">
                          <div className="rating-label">{ratingValue}★</div>
                          <div className="rating-bar-container">
                            <div
                              className="rating-bar-fill"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 10 ? `${percentage}%` : ""}
                            </div>
                          </div>
                          <div className="rating-count">
                            {count} ({percentage}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Traditional rating bars for aggregated data
            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = responseData.details?.find((d) =>
                  d.label.startsWith(rating.toString())
                );
                const count = ratingData?.count || 0;
                const percentage = ratingData?.percentage || 0;

                return (
                  <div key={rating} className="rating-bar-item">
                    <div className="rating-label">{rating}★</div>
                    <div className="rating-bar-container">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="rating-count">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {comparisonType === "multi-select" && (
        <div className="selection-visualization">
          <div className="selection-summary">
            <p>
              <strong>Selection Distribution</strong> - This shows the frequency
              of each option selected across all responses. Total selections:{" "}
              <strong>
                {responseData.totalSelections ||
                  responseData.details.reduce(
                    (sum, item) => sum + item.count,
                    0
                  )}
              </strong>
            </p>
          </div>

          <div className="selection-bars">
            {responseData.details.map((item, index) => (
              <div key={index} className="selection-bar-item">
                <div className="selection-label">{item.label}</div>
                <div className="selection-bar-container">
                  <div
                    className="selection-bar-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="selection-count">
                  {item.count} selections ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>

          <div className="multi-select-notes">
            <p>
              Note: In multi-select questions, participants can select multiple
              options, so the total percentage may exceed 100%.
            </p>
          </div>
        </div>
      )}

      {comparisonType === "single-select" && (
        <div className="selection-visualization">
          <div className="selection-summary">
            <p>
              Top selected option:{" "}
              <strong>{responseData.details[0]?.label || "None"}</strong>(
              {responseData.details[0]?.percentage || 0}%)
            </p>
          </div>

          <div className="selection-bars">
            {responseData.details.map((item, index) => (
              <div key={index} className="selection-bar-item">
                <div className="selection-label" title={item.label}>
                  {item.label}
                </div>
                <div className="selection-bar-container">
                  <div
                    className="selection-bar-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="selection-count">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// DemographicDetailModal Component
const DemographicDetailModal = ({
  show,
  onClose,
  data,
  demographicValue,
  comparisonType,
  comparisonTitle,
  exportStimulusDataToCSV,
}) => {
  if (!show) return null;

  return (
    <div className="demographic-modal-overlay">
      <div className="demographic-modal">
        <div className="modal-header">
          <h3>
            {comparisonTitle || "Comparison"} - {demographicValue} Breakdown
          </h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {data && data.details ? (
            <>
              {comparisonType === "binary" && (
                <div className="binary-detail">
                  <div className="detail-summary">
                    <p>
                      <strong>{demographicValue}</strong> responded with{" "}
                      {data.details.find((d) => d.label === "Yes")
                        ?.percentage || 0}
                      % Yes and{" "}
                      {data.details.find((d) => d.label === "No")?.percentage ||
                        0}
                      % No
                    </p>
                  </div>

                  <div className="binary-bar detail-bar">
                    <div
                      className="yes-portion"
                      style={{
                        width: `${
                          data.details.find((d) => d.label === "Yes")
                            ?.percentage || 0
                        }%`,
                      }}
                    >
                      Yes (
                      {data.details.find((d) => d.label === "Yes")?.count || 0})
                    </div>
                    <div
                      className="no-portion"
                      style={{
                        width: `${
                          data.details.find((d) => d.label === "No")
                            ?.percentage || 0
                        }%`,
                      }}
                    >
                      No (
                      {data.details.find((d) => d.label === "No")?.count || 0})
                    </div>
                  </div>
                </div>
              )}

              {comparisonType === "rating" && (
                <div className="rating-detail">
                  <div className="detail-summary">
                    <p>
                      <strong>{demographicValue}</strong> gave an average rating
                      of{" "}
                      <strong>
                        {data.averageRating ||
                          (data.details && data.details.length > 0
                            ? (
                                data.details.reduce((sum, item) => {
                                  const rating = parseInt(item.label);
                                  return sum + rating * item.count;
                                }, 0) /
                                data.details.reduce(
                                  (sum, item) => sum + item.count,
                                  0
                                )
                              ).toFixed(1)
                            : "N/A")}
                      </strong>
                    </p>
                  </div>

                  {/* If we have per-stimulus data, render each stimulus with its ratings */}
                  {data.isPerStimulus && data.stimuliRatings ? (
                    <div className="stimuli-ratings-container">
                      <div className="stimuli-ratings-title">
                        Ratings by Stimulus ID for {demographicValue}
                      </div>
                      {data.stimuliRatings.map((stimulusRating) => (
                        <div
                          key={stimulusRating.stimulusId}
                          className="stimulus-rating-card"
                        >
                          <div className="stimulus-rating-header">
                            <span className="stimulus-id">
                              {stimulusRating.stimulusId}
                            </span>
                            <span className="stimulus-average">
                              Average: <strong>{stimulusRating.average}</strong>
                            </span>
                            <span className="stimulus-total">
                              Total ratings: {stimulusRating.totalRatings}
                            </span>
                          </div>
                          <div className="stimulus-rating-bars">
                            {[5, 4, 3, 2, 1].map((ratingValue) => {
                              const ratingData =
                                stimulusRating.ratingDetails.find(
                                  (d) => d.rating === ratingValue
                                );
                              const count = ratingData?.count || 0;
                              const percentage = ratingData?.percentage || 0;

                              return (
                                <div
                                  key={ratingValue}
                                  className="rating-bar-item"
                                >
                                  <div className="rating-label">
                                    {ratingValue}★
                                  </div>
                                  <div className="rating-bar-container">
                                    <div
                                      className="rating-bar-fill"
                                      style={{ width: `${percentage}%` }}
                                    >
                                      {percentage > 10 ? `${percentage}%` : ""}
                                    </div>
                                  </div>
                                  <div className="rating-count">
                                    {count} ({percentage}%)
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Traditional rating bars for aggregated data
                    <div className="rating-bars detail-bars">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const ratingData = data.details.find((d) =>
                          d.label.startsWith(rating.toString())
                        );
                        const count = ratingData?.count || 0;
                        const percentage = ratingData?.percentage || 0;

                        return (
                          <div key={rating} className="rating-bar-item">
                            <div className="rating-label">{rating}★</div>
                            <div className="rating-bar-container">
                              <div
                                className="rating-bar-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="rating-count">
                              {count} ({percentage}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {comparisonType === "multi-select" && (
                <div className="selection-detail">
                  <div className="detail-summary">
                    <p>
                      <strong>{demographicValue}</strong> made a total of{" "}
                      <strong>
                        {data.totalSelections ||
                          data.details.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )}
                      </strong>{" "}
                      selections
                    </p>

                    <div className="multi-select-distribution-summary">
                      <p className="distribution-note">
                        Distribution of selections:
                      </p>
                      <div className="top-selections">
                        {data.details.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="selection-chip">
                            <span className="chip-label">{item.label}</span>
                            <span className="chip-percentage">
                              {item.percentage}%
                            </span>
                          </div>
                        ))}
                        {data.details.length > 3 && (
                          <div className="more-selections-note">
                            + {data.details.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="selection-bars detail-bars">
                    {data.details.map((item, index) => (
                      <div key={index} className="selection-bar-item">
                        <div className="selection-label" title={item.label}>
                          {item.label}
                        </div>
                        <div className="selection-bar-container">
                          <div
                            className="selection-bar-fill"
                            style={{ width: `${item.percentage}%` }}
                          >
                            {item.percentage > 15 ? `${item.percentage}%` : ""}
                          </div>
                        </div>
                        <div className="selection-count">
                          {item.count} selections ({item.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="multi-select-notes">
                    <p>
                      Note: In multi-select questions, participants can select
                      multiple options, so percentages may add up to more than
                      100%.
                    </p>
                  </div>
                </div>
              )}

              {comparisonType === "single-select" && (
                <div className="selection-detail">
                  <div className="detail-summary">
                    <p>
                      <strong>{demographicValue}</strong> made a total of{" "}
                      <strong>
                        {data.details.reduce(
                          (sum, item) => sum + item.count,
                          0
                        )}
                      </strong>{" "}
                      selections
                    </p>
                  </div>

                  <div className="selection-bars detail-bars">
                    {data.details.map((item, index) => (
                      <div key={index} className="selection-bar-item">
                        <div className="selection-label" title={item.label}>
                          {item.label}
                        </div>
                        <div className="selection-bar-container">
                          <div
                            className="selection-bar-fill"
                            style={{ width: `${item.percentage}%` }}
                          >
                            {item.percentage > 15 ? `${item.percentage}%` : ""}
                          </div>
                        </div>
                        <div className="selection-count">
                          {item.count} ({item.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data-message">No detailed data available</div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="export-button"
            onClick={() => exportStimulusDataToCSV(data, demographicValue)}
          >
            Export to CSV
          </button>
          <button className="close-button-text" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyDetailsPage;
