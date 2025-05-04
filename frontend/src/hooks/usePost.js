import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const usePost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useAuth();

  const postData = async (url, payload) => {
    setLoading(true);

    try {
      const response = await axios.post(url, payload);
      setData(response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setUser(null);
      }
      setError(error);
      return null; // this is to ensure that if !no data, we can use it conditonally on frontend
    } finally {
      setLoading(false);
    }
  };

  return { postData, data, loading, error };
};

export default usePost;
