import { useState, useEffect } from 'react';
import { getUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../utils';
import { loginUser } from '../api';

/**
 * Custom hook for authentication state management
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  /**
   * Login function
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Login result
   */
  const login = async (username, password) => {
    try {
      setLoading(true);
      const user = await loginUser(username, password);
      setUser(user);
      setIsAuthenticated(true);
      saveUserToStorage(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    removeUserFromStorage();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};
