import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Chip, Typography, Fade } from "@mui/material";
import { Menu as MenuIcon, AccountBalanceWallet, ConnectWithoutContact, MonetizationOn } from "@mui/icons-material";
import { NAVIGATION_ITEMS, COLORS, Z_INDEX } from "../constants";
import { useWalletContext } from "../contexts/WalletContext";

function Navbar({ logout, _user }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  const { isConnected, isConnecting, error, connect, disconnect, displayInfo } = useWalletContext();

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

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  // Creative Wallet Display Component
  const WalletSection = () => {
    if (isConnected) {
      return (
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              p: 1.5,
              border: "2px solid rgba(255, 0, 30, 0.1)",
              boxShadow: "0 8px 32px rgba(255, 0, 30, 0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(255, 0, 30, 0.25)",
                borderColor: "rgba(255, 0, 30, 0.3)",
              },
            }}
          >
            {/* Balance Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "linear-gradient(135deg, #ff001e, #d4001a)",
                background: "linear-gradient(135deg, #ff001e, #d4001a)",
                borderRadius: "16px",
                px: 2,
                py: 1,
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
                fontFamily: "Poppins",
                boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  animation: "shine 2s infinite",
                },
                "@keyframes shine": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(100%)" },
                },
              }}
            >
              <MonetizationOn sx={{ fontSize: "1.2rem" }} />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "white",
                }}
              >
                {displayInfo.isLoading ? "..." : `${displayInfo.formattedTokenBalance} SG`}
              </Typography>
            </Box>

            {/* Address Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderRadius: "12px",
                px: 1.5,
                py: 0.5,
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <AccountBalanceWallet sx={{ color: COLORS.success, fontSize: "1.1rem" }} />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: COLORS.secondary,
                }}
              >
                {displayInfo.formattedAddress}
              </Typography>
            </Box>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              sx={{
                color: COLORS.error,
                borderColor: COLORS.error,
                fontSize: "0.7rem",
                py: 0.5,
                px: 1.5,
                borderRadius: "10px",
                fontFamily: "Poppins",
                fontWeight: 600,
                textTransform: "none",
                border: "1px solid",
                minWidth: "auto",
                "&:hover": {
                  borderColor: COLORS.error,
                  backgroundColor: "rgba(244, 67, 54, 0.05)",
                  transform: "scale(1.05)",
                },
              }}
              variant="outlined"
            >
              Disconnect
            </Button>
          </Box>
        </Fade>
      );
    }

    return (
      <Fade in={true} timeout={800}>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          startIcon={<ConnectWithoutContact />}
          sx={{
            background: "linear-gradient(135deg, #ff001e, #d4001a)",
            color: "white",
            fontWeight: 600,
            fontFamily: "Poppins",
            textTransform: "none",
            borderRadius: "20px",
            px: 3,
            py: 1.5,
            fontSize: "0.9rem",
            boxShadow: "0 8px 32px rgba(255, 0, 30, 0.25)",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
              animation: "shine 2s infinite",
            },
            "&:hover": {
              background: "linear-gradient(135deg, #d4001a, #b30017)",
              transform: "translateY(-2px) scale(1.05)",
              boxShadow: "0 12px 40px rgba(255, 0, 30, 0.35)",
            },
            "@keyframes shine": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }}
          variant="contained"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </Fade>
    );
  };

  // Mobile Wallet Display
  const MobileWalletSection = () => {
    if (isConnected) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            p: 1,
            border: "2px solid rgba(255, 0, 30, 0.1)",
            boxShadow: "0 4px 16px rgba(255, 0, 30, 0.15)",
          }}
        >
          <MonetizationOn sx={{ color: COLORS.primary, fontSize: "1.1rem" }} />
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: COLORS.secondary,
            }}
          >
            {displayInfo.formattedTokenBalance} SG
          </Typography>
          <Chip icon={<AccountBalanceWallet />} label={displayInfo.formattedAddress} color="success" size="small" onClick={handleDisconnect} sx={{ cursor: "pointer", fontSize: "0.7rem" }} />
        </Box>
      );
    }

    return (
      <Button
        size="small"
        variant="outlined"
        startIcon={<ConnectWithoutContact />}
        onClick={handleConnect}
        disabled={isConnecting}
        sx={{
          color: COLORS.primary,
          borderColor: COLORS.primary,
          fontSize: "0.7rem",
          borderRadius: "12px",
          fontFamily: "Poppins",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            borderColor: COLORS.primary,
            backgroundColor: "rgba(255, 0, 30, 0.05)",
          },
        }}
      >
        {isConnecting ? "..." : "Connect"}
      </Button>
    );
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

            {/* Wallet Display */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <WalletSection />
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
            </Box>
          </>
        ) : (
          // Mobile Navigation
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Wallet Display for Mobile */}
            <MobileWalletSection />

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
