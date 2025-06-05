const BASE_URL = process.env.REACT_APP_BASE_URL;


export const getStudyById = async (studyId) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch study");
  }

  return await res.json();
};

export const publishStudy = async (studyId) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}/activate`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to publish study");
  }

  return await res.json();
};

export const unpublishStudy = async (studyId) => {
  const res = await fetch(`${BASE_URL}/api/studies/${studyId}/deactivate`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to unpublish study");
  }

  return await res.json();
};

export const deleteStudy = async (studyId) => {
  const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/studies/${studyId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete study");
  }

  return true;
};