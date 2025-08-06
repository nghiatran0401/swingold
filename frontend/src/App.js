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
import { WalletProvider } from "./contexts/WalletContext";

function App() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <WalletProvider>
      <Router>
        <Navbar logout={logout} user={user} />
        <Routes>
          {/* Root path - show dashboard for authenticated users, redirect to login for others */}
          <Route element={isAuthenticated ? <Dashboard logout={logout} /> : <Navigate replace to="/login" />} path="/" />

          {/* Login route (not protected) */}
          <Route element={<Login isAuthenticated={isAuthenticated} login={login} />} path="/login" />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Events logout={logout} />
              </ProtectedRoute>
            }
            path="/events"
          />
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Items logout={logout} />
              </ProtectedRoute>
            }
            path="/items"
          />
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Wallet logout={logout} />
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
    </WalletProvider>
  );
}

export default App;
