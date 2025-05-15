import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "./StudyDetailsPage.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const StudyDetailsPage = () => {
  const { studyId } = useParams();
  const [selectedDemographic, setSelectedDemographic] = useState("gender");
  const [selectedComparison, setSelectedComparison] = useState(null);
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
  };

  // Format demographic labels for better readability
  const formatDemographicLabel = (type, label) => {
    if (label === "Not Specified") return label;

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
    if (!responseDistribution || !responseDistribution[demographicKey]) {
      return { summary: "No data", details: null };
    }

    const data = responseDistribution[demographicKey];

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
        if (!data.ratings) return { summary: "No ratings", details: null };

        // Calculate average rating
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

        // Find most selected option
        const selections = data.selections;
        const mostSelected = Object.entries(selections)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([option, count]) => ({ option, count: Number(count) }));

        return {
          summary:
            mostSelected.length > 0 ? `Top: ${mostSelected[0].option}` : "None",
          details: mostSelected.map((item) => ({
            label: item.option,
            count: item.count,
            percentage:
              mostSelected.reduce((sum, i) => sum + i.count, 0) > 0
                ? Math.round(
                    (item.count /
                      mostSelected.reduce((sum, i) => sum + i.count, 0)) *
                      100
                  )
                : 0,
          })),
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
              <h3>
                {selectedComparison
                  ? `Statistics for "${
                      studyData?.comparisons?.find(
                        (c) => c._id === selectedComparison
                      )?.title || "Comparison"
                    }" by ${
                      selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"
                    }`
                  : `Overall ${
                      selectedDemographic === "ageGroup"
                        ? "Age Group"
                        : selectedDemographic === "educationLevel"
                        ? "Education Level"
                        : "Gender"
                    } Distribution`}
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
                      {selectedComparison &&
                        selectedComparisonStats.comparisonType &&
                        getColumnHeaders(
                          selectedComparisonStats.comparisonType
                        ).map((header, i) => <th key={i}>{header}</th>)}
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedComparison ? (
                      selectedComparisonStats.data.length > 0 ? (
                        selectedComparisonStats.data.map((row, index) => {
                          // Get detailed response data for this demographic group if available
                          const responseData = formatResponseData(
                            selectedComparisonStats.comparisonType,
                            row.label,
                            selectedComparisonStats.responseDistribution
                          );

                          return (
                            <tr key={index}>
                              <td>{row.label}</td>
                              <td>{row.count}</td>
                              <td>{row.percentage}%</td>

                              {/* Render data specific to the comparison type */}
                              {selectedComparisonStats.comparisonType ===
                                "binary" && (
                                <>
                                  <td>{responseData.summary}</td>
                                </>
                              )}

                              {selectedComparisonStats.comparisonType ===
                                "rating" && (
                                <>
                                  <td>{responseData.summary}</td>
                                </>
                              )}

                              {selectedComparisonStats.comparisonType ===
                                "multi-select" && (
                                <>
                                  <td>{responseData.summary}</td>
                                </>
                              )}

                              {selectedComparisonStats.comparisonType ===
                                "single-select" && (
                                <>
                                  <td>{responseData.summary}</td>
                                </>
                              )}

                              <td>
                                <div className="bar-visualization">
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${row.percentage}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={
                              selectedComparisonStats.comparisonType ? "6" : "4"
                            }
                          >
                            No response data available for this comparison
                          </td>
                        </tr>
                      )
                    ) : overallDemographicStats.length > 0 ? (
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

              {/* Response distribution for the selected comparison */}
              {selectedComparison &&
                selectedComparisonStats.responseCount > 0 && (
                  <div className="response-distribution">
                    <h4>Response Distribution</h4>

                    <p className="response-count">
                      Total responses:{" "}
                      <strong>{selectedComparisonStats.responseCount}</strong>
                    </p>

                    {/* Detailed response visualization based on comparison type */}
                    <div className="response-visualization">
                      {selectedComparisonStats.comparisonType === "binary" && (
                        <div className="binary-distribution">
                          <h5>Response Distribution by Option</h5>
                          <div className="option-bars">
                            {/* Here we'd show aggregated yes/no responses */}
                            <div className="option-bar-container">
                              <div className="option-label">Yes</div>
                              <div className="option-bar-wrapper">
                                <div
                                  className="option-bar yes-bar"
                                  style={{
                                    width: `${
                                      (Object.values(
                                        selectedComparisonStats.responseDistribution ||
                                          {}
                                      ).reduce(
                                        (sum, data) => sum + (data.yes || 0),
                                        0
                                      ) /
                                        Object.values(
                                          selectedComparisonStats.responseDistribution ||
                                            {}
                                        ).reduce(
                                          (sum, data) =>
                                            sum +
                                            (data.yes || 0) +
                                            (data.no || 0),
                                          0
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="option-value">
                                {Object.values(
                                  selectedComparisonStats.responseDistribution ||
                                    {}
                                ).reduce(
                                  (sum, data) => sum + (data.yes || 0),
                                  0
                                )}
                              </div>
                            </div>
                            <div className="option-bar-container">
                              <div className="option-label">No</div>
                              <div className="option-bar-wrapper">
                                <div
                                  className="option-bar no-bar"
                                  style={{
                                    width: `${
                                      (Object.values(
                                        selectedComparisonStats.responseDistribution ||
                                          {}
                                      ).reduce(
                                        (sum, data) => sum + (data.no || 0),
                                        0
                                      ) /
                                        Object.values(
                                          selectedComparisonStats.responseDistribution ||
                                            {}
                                        ).reduce(
                                          (sum, data) =>
                                            sum +
                                            (data.yes || 0) +
                                            (data.no || 0),
                                          0
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="option-value">
                                {Object.values(
                                  selectedComparisonStats.responseDistribution ||
                                    {}
                                ).reduce(
                                  (sum, data) => sum + (data.no || 0),
                                  0
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedComparisonStats.comparisonType === "rating" && (
                        <div className="rating-distribution">
                          <h5>Rating Distribution</h5>
                          <div className="rating-bars">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = Object.values(
                                selectedComparisonStats.responseDistribution ||
                                  {}
                              ).reduce(
                                (sum, data) =>
                                  sum + ((data.ratings || {})[rating] || 0),
                                0
                              );
                              const total = Object.values(
                                selectedComparisonStats.responseDistribution ||
                                  {}
                              ).reduce((sum, data) => {
                                const ratings = data.ratings || {};
                                return (
                                  sum +
                                  Object.values(ratings).reduce(
                                    (s, c) => s + Number(c),
                                    0
                                  )
                                );
                              }, 0);
                              const percentage =
                                total > 0 ? (count / total) * 100 : 0;

                              return (
                                <div
                                  key={rating}
                                  className="rating-bar-container"
                                >
                                  <div className="rating-label">{rating} ★</div>
                                  <div className="rating-bar-wrapper">
                                    <div
                                      className="rating-bar"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="rating-value">
                                    {count} ({Math.round(percentage)}%)
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(selectedComparisonStats.comparisonType ===
                        "single-select" ||
                        selectedComparisonStats.comparisonType ===
                          "multi-select") && (
                        <div className="selection-distribution">
                          <h5>Option Selection Distribution</h5>
                          <div className="distribution-note">
                            <p>
                              Detailed selection distribution visualization will
                              be shown here when more data is available.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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
    </div>
  );
};

export default StudyDetailsPage;
