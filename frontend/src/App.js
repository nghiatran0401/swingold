import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Items from "./pages/Items";
import Events from "./pages/Events";
import ProtectedRoute from "./components/ProtectedRoute";
import Wallet from "./pages/Wallet";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import { loginUser } from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function using backend
  const login = async (username, password) => {
    try {
      const user = await loginUser(username, password);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar user={user} logout={logout} />
      <Routes>
        {/* Redirect root to /events */}
        <Route path="/" element={<Navigate to="/events" replace />} />

        {/* Login route (not protected) */}
        <Route path="/login" element={<Login login={login} isAuthenticated={isAuthenticated} />} />

        {/* Protected routes */}
        <Route
          path="/events"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Events logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Items logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Wallet logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Admin user={user} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
