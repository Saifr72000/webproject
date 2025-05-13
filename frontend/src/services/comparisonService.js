const BASE_URL = process.env.REACT_APP_BASE_URL;

export const addComparisonToStudy = async (studyId, formData) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}/comparisons`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add comparison");
  }

  const data = await res.json();
  return data.comparison;
};

export const deleteComparison = async (comparisonId) => {
  const res = await fetch(`${BASE_URL}/api/comparisons/${comparisonId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete comparison");
  }

  return true;
};
