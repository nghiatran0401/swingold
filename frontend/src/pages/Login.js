import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, TextField, Alert } from "@mui/material";

export default function Login({ login, isAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      {/* Background Image Layer */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background: 'url("/images/background.jpg") center/cover no-repeat',
          filter: "brightness(0.7)",
          zIndex: -1,
        }}
      />

      {/* Login Card */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: { xs: "90%", sm: 420 },
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
            boxShadow: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "28px", sm: "36px" },
                color: "#2a2828",
                mb: 1,
              }}
            >
              SWIN GOLD
            </Typography>

            <Typography
              variant="h6"
              align="center"
              sx={{
                fontWeight: 300,
                fontSize: { xs: "14px", sm: "18px" },
                color: "#2a2828",
                mb: 3,
              }}
            >
              Facilitate Your Journey
            </Typography>

            {[
              ["Username", username, setUsername],
              ["Password", password, setPassword],
            ].map(([label, value, setValue], i) => (
              <TextField
                key={label}
                label={label}
                type={label === "Password" ? "password" : "text"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset, &.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#ff001e",
                  },
                }}
              />
            ))}

            {error && (
              <Alert severity="error" sx={{ my: 1 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              onClick={handleLogin}
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: 16,
                backgroundColor: "#ff001e",
                color: "white",
                "&:hover": {
                  backgroundColor: "#d4001a",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 8px rgba(255, 0, 30, 0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            {/* Demo login credentials */}
            <Typography variant="body2" align="center" sx={{ mt: 2, color: "#666", fontSize: 13 }}>
              User account: user / cos30049 <br />
              Admin account: admin / cos30049
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
