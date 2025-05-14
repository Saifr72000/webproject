const BASE_URL = process.env.REACT_APP_BASE_URL;

export const addComparisonToStudy = async (studyId, formData) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}/comparisons`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create comparison");
  }

  return await res.json(); // This includes `.comparison`
};

export const deleteComparison = async (comparisonId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/comparisons/${comparisonId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      // Attempt to extract error message from response JSON
      let errorMessage = "Failed to delete comparison";
      try {
        const err = await res.json();
        errorMessage = err.message || errorMessage;
      } catch {
        // if parsing JSON fails, keep the default error message
      }
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    // Optional: You could log or report the error here
    throw error;
  }
};