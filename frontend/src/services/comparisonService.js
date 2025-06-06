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

  return await res.json();
};

export const deleteComparison = async (comparisonId) => {
  const res = await fetch(`${BASE_URL}/api/comparisons/${comparisonId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete comparison");
  }

  return true;
};


export const updateComparison = async (comparisonId, formData) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/comparisons/${comparisonId}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );

    if (!res.ok) {
      let errorMessage = "Failed to update comparison";
      try {
        const err = await res.json();
        errorMessage = err.message || errorMessage;
      } catch {

      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};
