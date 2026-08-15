import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("AuthContext: Failed to parse stored user data.", error);
      // Failsafe: If the cache is corrupted with old schema data, wipe it clean.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken, userData) => {
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error("AuthContext: Failed to save auth session.", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("AuthContext: Failed to clear auth session.", error);
    }
  };

  // Optional but highly recommended: Allows you to update context if 
  // the user edits their profile later (e.g. changing phone number).
  const updateUser = (updatedFields) => {
    try {
      const newUserData = { ...user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error("AuthContext: Failed to update user data.", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        updateUser, 
        isAuthenticated: !!token 
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};