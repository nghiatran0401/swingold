import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { NAVIGATION_ITEMS, COLORS, Z_INDEX } from "../constants";

function Navbar({ logout, _user }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

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
        backgroundColor: COLORS.white,
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        borderBottom: `1px solid ${COLORS.gray[300]}`,
        zIndex: Z_INDEX.NAVBAR,
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
        <Box component={Link} sx={{ display: "flex", alignItems: "center" }} to="/">
          <img
            alt="Swinburne Logo"
            src="/images/logo.png"
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
              {NAVIGATION_ITEMS.map((item) => (
                <Button
                  component={Link}
                  key={item.path}
                  sx={{
                    color: isActive(item.path) ? COLORS.primary : COLORS.secondary,
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontSize: "16px",
                    textTransform: "none",
                    px: 1,
                    borderBottom: isActive(item.path) ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 0, 30, 0.05)",
                      borderBottom: `2px solid ${COLORS.primary}`,
                    },
                  }}
                  to={item.path}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Button
              onClick={handleLogout}
              sx={{
                color: COLORS.secondary,
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "16px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 30, 0.1)",
                  color: COLORS.primary,
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
              onClose={handleMobileMenuClose}
              open={Boolean(mobileMenuAnchor)}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#FFFBFB",
                  width: "200px",
                  mt: 1,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {NAVIGATION_ITEMS.map((item) => (
                <MenuItem
                  component={Link}
                  key={item.path}
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
                  to={item.path}
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
