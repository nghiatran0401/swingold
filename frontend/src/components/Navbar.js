import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

function Navbar({ logout, user }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const navigationItems = [
    { path: "/events", label: "Events" },
    { path: "/items", label: "Items" },
    { path: "/wallet", label: "Wallet" },
    { path: "/admin", label: "Admin" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#FFFBFB",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        borderBottom: "1px solid #e0e0e0",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Box component={Link} to="/events" sx={{ display: "flex", alignItems: "center" }}>
          <img
            src="/images/logo.png"
            alt="Swinburne Logo"
            style={{
              height: isMobile ? "40px" : "48px",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Desktop Navigation */}
        {!isMobile ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", flex: 1, gap: 4 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: isActive(item.path) ? "#ff001e" : "#2A2828",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontSize: "16px",
                    textTransform: "none",
                    px: 1,
                    borderBottom: isActive(item.path) ? "2px solid #ff001e" : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 30, 0.05)",
                      borderBottom: "2px solid #ff001e",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Button
              onClick={handleLogout}
              sx={{
                color: "#2A2828",
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "16px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 30, 0.1)",
                  color: "#ff001e",
                },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          // Mobile Navigation
          <Box>
            <IconButton onClick={handleMobileMenuOpen} sx={{ color: "#2A2828" }}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#FFFBFB",
                  width: "200px",
                  mt: 1,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={handleMobileMenuClose}
                  sx={{
                    color: isActive(item.path) ? "#ff001e" : "#2A2828",
                    fontFamily: "Poppins",
                    fontWeight: isActive(item.path) ? 700 : 600,
                    fontSize: "15px",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 30, 0.05)",
                    },
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "#2A2828",
                  fontFamily: "Poppins",
                  fontWeight: "600",
                  fontSize: "15px",
                  py: 1.5,
                  borderTop: "1px solid #e0e0e0",
                  "&:hover": {
                    backgroundColor: "rgba(255, 0, 30, 0.1)",
                    color: "#ff001e",
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
