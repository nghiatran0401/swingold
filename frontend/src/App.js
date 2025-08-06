import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Items from "./pages/Items";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute, Navbar } from "./components";
import Wallet from "./pages/Wallet";
import Admin from "./pages/Admin";
import { useAuth } from "./hooks";
import { WalletProvider, useWalletContext } from "./contexts/WalletContext";

// Wrapper component to handle logout with wallet disconnection
function AppContent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <WalletProvider user={user}>
      <AppContentInner isAuthenticated={isAuthenticated} user={user} login={login} logout={logout} />
    </WalletProvider>
  );
}

function AppContentInner({ isAuthenticated, user, login, logout }) {
  const { disconnect } = useWalletContext();

  const handleLogout = async () => {
    logout();
  };

  return (
    <Router>
      <Navbar logout={handleLogout} user={user} />
      <Routes>
        {/* Root path - show dashboard for authenticated users, redirect to login for others */}
        <Route element={isAuthenticated ? <Dashboard logout={handleLogout} /> : <Navigate replace to="/login" />} path="/" />

        {/* Login route (not protected) */}
        <Route element={<Login isAuthenticated={isAuthenticated} login={login} />} path="/login" />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Events logout={handleLogout} />
            </ProtectedRoute>
          }
          path="/events"
        />
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Items logout={handleLogout} />
            </ProtectedRoute>
          }
          path="/items"
        />
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Wallet logout={handleLogout} />
            </ProtectedRoute>
          }
          path="/wallet"
        />
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Admin user={user} />
            </ProtectedRoute>
          }
          path="/admin"
        />

        {/* Fallback - show 404 for authenticated users, redirect to login for others */}
        <Route
          element={
            isAuthenticated ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  fontFamily: "Poppins",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <button
                  onClick={() => window.history.back()}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(45deg, #ff001e, #d4001a)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "Poppins",
                  }}
                >
                  Go Back
                </button>
              </div>
            ) : (
              <Navigate replace to="/login" />
            )
          }
          path="*"
        />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
