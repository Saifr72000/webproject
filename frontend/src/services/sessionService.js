const BASE_URL = process.env.REACT_APP_BASE_URL;


export const checkSessionExists = async (studyId) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}/check-session-exists`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to check session existence");
  }

  return await res.json();
};