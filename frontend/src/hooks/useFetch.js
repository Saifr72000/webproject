import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(url);
        setData(res.data); //set the data into the state variable
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUser(null);
        }
        setError(err);
      } finally {
        setLoading(false); // overall disabling the loading state after both try and catch is run
      }
    };
    fetchData();
  }, [url, setUser]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUser(null);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
