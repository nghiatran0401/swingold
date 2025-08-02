import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { heroStyles, cardStyles, buttonStyles } from '../styles/common';
import { COLORS } from '../constants';

const Dashboard = ({ logout }) => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: '🎉 Events',
      description: 'Browse and enroll in university events',
      path: '/events',
      color: COLORS.primary,
    },
    {
      title: '🛍️ Items',
      description: 'Purchase university merchandise and items',
      path: '/items',
      color: COLORS.success,
    },
    {
      title: '💰 Wallet',
      description: 'Manage your GOLD tokens and transactions',
      path: '/wallet',
      color: COLORS.warning,
    },
    {
      title: '⚙️ Admin',
      description: 'Manage events and items (Admin only)',
      path: '/admin',
      color: COLORS.error,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box sx={heroStyles.root}>
        <Box sx={heroStyles.content}>
          <Typography sx={heroStyles.title}>
            Welcome to SwinGold
          </Typography>
          <Typography sx={heroStyles.subtitle}>
            Your gateway to Swinburne University's digital ecosystem
          </Typography>
        </Box>
      </Box>

      {/* Dashboard Content */}
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: 4,
          pb: 8,
          mt: -8,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            p: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(255, 0, 30, 0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: '700',
              color: COLORS.secondary,
              mb: 3,
              textAlign: 'center',
            }}
          >
            What would you like to do today?
          </Typography>

          <Grid container spacing={3}>
            {dashboardItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    ...cardStyles.root,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${item.color}20`,
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: '700',
                      color: COLORS.secondary,
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Poppins',
                      color: COLORS.gray[600],
                      mb: 3,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      ...buttonStyles.primary,
                      background: `linear-gradient(45deg, ${item.color}, ${item.color}dd)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${item.color}dd, ${item.color}bb)`,
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                  >
                    Go to {item.title.split(' ')[1]}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default Dashboard; 