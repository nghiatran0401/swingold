import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { heroStyles, cardStyles, buttonStyles } from "../styles/common";
import { COLORS } from "../constants";

const Dashboard = ({ _logout }) => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "🎉 Events",
      path: "/events",
      color: COLORS.primary,
    },
    {
      title: "🛍️ Items",
      path: "/items",
      color: COLORS.success,
    },
    {
      title: "💰 Wallet",
      path: "/wallet",
      color: COLORS.warning,
    },
    {
      title: "⚙️ Admin",
      path: "/admin",
      color: COLORS.error,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: COLORS.background }}>
      {/* Hero Section */}
      <Box sx={heroStyles.root}>
        <Box sx={heroStyles.content}>
          <Typography sx={heroStyles.title}>Welcome to SwinGold</Typography>
          <Typography sx={heroStyles.subtitle}>Your gateway to Swinburne University's digital ecosystem</Typography>
        </Box>
      </Box>

      {/* Dashboard Content */}
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, sm: 5, md: 6 },
          pt: { xs: 1, sm: 2 },
          mt: { xs: -4, sm: -6, md: -8 },
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: { xs: "16px", sm: "20px", md: "24px" },
            p: { xs: 2.5, sm: 3, md: 4 },
            boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(255, 0, 30, 0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: "700",
              color: COLORS.secondary,
              mb: { xs: 2.5, sm: 3, md: 4 },
              textAlign: "center",
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
              lineHeight: 1.2,
            }}
            variant="h4"
          >
            What would you like to do today?
          </Typography>

          <Grid
            container
            spacing={{ xs: 1.5, sm: 2, md: 3 }}
            sx={{
              mt: { xs: 0.5, sm: 1 },
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            {dashboardItems.map((item, index) => (
              <Grid item key={index} xs={6} sm={3}>
                <Paper
                  elevation={0}
                  onClick={() => navigate(item.path)}
                  sx={{
                    ...cardStyles.root,
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    textAlign: "center",
                    cursor: "pointer",
                    height: { xs: "100px", sm: "110px", md: "120px" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.02)",
                      boxShadow: `0 12px 24px ${item.color}20`,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: "700",
                      color: COLORS.secondary,
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                      lineHeight: 1.2,
                      mb: { xs: 1, sm: 1.5 },
                    }}
                    variant="h5"
                  >
                    {item.title}
                  </Typography>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                    sx={{
                      ...buttonStyles.primary,
                      background: `linear-gradient(45deg, ${item.color}, ${item.color}dd)`,
                      fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1, sm: 1.5 },
                      "&:hover": {
                        background: `linear-gradient(45deg, ${item.color}dd, ${item.color}bb)`,
                      },
                    }}
                    variant="contained"
                  >
                    Go to {item.title.split(" ")[1]}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
