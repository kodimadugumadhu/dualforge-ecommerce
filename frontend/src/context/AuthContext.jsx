import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_AUTH_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically renew token on startup if refresh token is available
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('df_user');
      const savedToken = localStorage.getItem('df_token');
      const savedRefreshToken = localStorage.getItem('df_refresh_token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }

      // If we have a refresh token, verify/refresh it to maintain session security
      if (savedRefreshToken) {
        try {
          const res = await fetch(`${API_AUTH_URL}/refreshtoken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: savedRefreshToken })
          });

          if (res.ok) {
            const data = await res.json();
            setToken(data.accessToken);
            localStorage.setItem('df_token', data.accessToken);
          } else {
            // Clean up session if token validation fails
            logout();
          }
        } catch (err) {
          console.error("Auto session validation failed:", err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_AUTH_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      setToken(data.accessToken);
      localStorage.setItem('df_user', JSON.stringify(data));
      localStorage.setItem('df_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('df_refresh_token', data.refreshToken);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (signUpData) => {
    try {
      const response = await fetch(`${API_AUTH_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const renewToken = async () => {
    const refreshToken = localStorage.getItem('df_refresh_token');
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_AUTH_URL}/refreshtoken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.accessToken);
        localStorage.setItem('df_token', data.accessToken);
        return data.accessToken;
      } else {
        logout();
      }
    } catch (err) {
      console.error("Token renewal failed:", err);
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('df_user');
    localStorage.removeItem('df_token');
    localStorage.removeItem('df_refresh_token');
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isAdmin: user?.role === 'ROLE_ADMIN', loading, login, register, logout, getAuthHeaders, renewToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
