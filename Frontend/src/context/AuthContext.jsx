import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import axiosInstance from '../instance/axiosInstance'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axiosInstance.get(`${url}/dishes/verify-token`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [url]);

  const loginUser = async (loginData) => {
    const trimmedData = {
      email: loginData.email.trim(),
      password: loginData.password.trim(),
    };
    const res = await axios.post(`${url}/dishes/login`, trimmedData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    setIsAuthenticated(true);
    return res.data
  };

  const logoutUser = async () => {
    const res = await axios.post(`${url}/dishes/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
    return res.data
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
