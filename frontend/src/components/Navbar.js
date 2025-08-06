import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Chip, Typography, Fade } from "@mui/material";
import { Menu as MenuIcon, AccountBalanceWallet, ConnectWithoutContact, MonetizationOn, Refresh } from "@mui/icons-material";
import { NAVIGATION_ITEMS, COLORS, Z_INDEX } from "../constants";
import { useWalletContext } from "../contexts/WalletContext";
import { useAuth } from "../hooks/useAuth";

function Navbar({ logout, user }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  const { isConnected, isConnecting, error, connect, disconnect, displayInfo, refreshBalance } = useWalletContext();

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
      alert(`Failed to connect wallet: ${err.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  };

  // Creative Wallet Display Component
  const WalletSection = () => {
    // Only show wallet section if user is authenticated
    if (!user || !user.id) {
      return null;
    }

    // Show error state
    if (error) {
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
              border: "2px solid rgba(244, 67, 54, 0.3)",
              boxShadow: "0 8px 32px rgba(244, 67, 54, 0.2)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#f44336",
              }}
            >
              Connection Error
            </Typography>
            <Button
              onClick={handleConnect}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "linear-gradient(135deg, #f44336, #d32f2f)",
                borderRadius: "12px",
                px: 2,
                py: 1,
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "linear-gradient(135deg, #d32f2f, #c62828)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Retry
            </Button>
          </Box>
        </Fade>
      );
    }

    // Show connecting state
    if (isConnecting) {
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
              border: "2px solid rgba(255, 193, 7, 0.3)",
              boxShadow: "0 8px 32px rgba(255, 193, 7, 0.2)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#ff9800",
              }}
            >
              Connecting...
            </Typography>
          </Box>
        </Fade>
      );
    }

    // Show connected state
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
              <IconButton
                onClick={handleRefreshBalance}
                sx={{
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <Refresh sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Box>

            {/* Address Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderRadius: "12px",
                px: 2,
                py: 1,
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: "1.1rem", color: "#4caf50" }} />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "#2e7d32",
                }}
              >
                {displayInfo.formattedAddress}
              </Typography>
            </Box>

            {/* Disconnect Button */}
            <IconButton
              onClick={handleDisconnect}
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "#f44336",
                borderRadius: "12px",
                p: 1,
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ConnectWithoutContact sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Box>
        </Fade>
      );
    }

    // Show connect button if not connected
    return (
      <Fade in={true} timeout={800}>
        <Button
          onClick={handleConnect}
          variant="contained"
          startIcon={<ConnectWithoutContact />}
          sx={{
            backgroundColor: "linear-gradient(135deg, #ff001e, #d4001a)",
            borderRadius: "20px",
            px: 3,
            py: 1.5,
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: "0.9rem",
            textTransform: "none",
            boxShadow: "0 8px 32px rgba(255, 0, 30, 0.25)",
            "&:hover": {
              backgroundColor: "linear-gradient(135deg, #d4001a, #b3001a)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 40px rgba(255, 0, 30, 0.35)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Connect Wallet
        </Button>
      </Fade>
    );
  };

  // Mobile Wallet Display
  const MobileWalletSection = () => {
    // Only show wallet section if user is authenticated
    if (!user || !user.id) {
      return null;
    }

    // Show error state
    if (error) {
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
            border: "2px solid rgba(244, 67, 54, 0.3)",
            boxShadow: "0 4px 16px rgba(244, 67, 54, 0.2)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#f44336",
            }}
          >
            Error
          </Typography>
          <Button
            onClick={handleConnect}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "linear-gradient(135deg, #f44336, #d32f2f)",
              borderRadius: "8px",
              px: 1.5,
              py: 0.5,
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "none",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "linear-gradient(135deg, #d32f2f, #c62828)",
              },
            }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    // Show connecting state
    if (isConnecting) {
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
            border: "2px solid rgba(255, 193, 7, 0.3)",
            boxShadow: "0 4px 16px rgba(255, 193, 7, 0.2)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#ff9800",
            }}
          >
            Connecting...
          </Typography>
        </Box>
      );
    }

    // Show connected state
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
          <MonetizationOn sx={{ color: "#ff001e", fontSize: "1.1rem" }} />
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#2e7d32",
            }}
          >
            {displayInfo.formattedTokenBalance} SG
          </Typography>
          <IconButton
            onClick={handleRefreshBalance}
            size="small"
            sx={{
              color: "#ff001e",
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(255, 0, 30, 0.1)",
              },
            }}
          >
            <Refresh sx={{ fontSize: "0.9rem" }} />
          </IconButton>
          <Chip icon={<AccountBalanceWallet />} label={displayInfo.formattedAddress} color="success" size="small" onClick={handleDisconnect} sx={{ cursor: "pointer", fontSize: "0.7rem" }} />
        </Box>
      );
    }

    // Show connect button if not connected
    return (
      <Button
        onClick={handleConnect}
        variant="contained"
        size="small"
        startIcon={<ConnectWithoutContact />}
        sx={{
          backgroundColor: "linear-gradient(135deg, #ff001e, #d4001a)",
          borderRadius: "16px",
          px: 2,
          py: 0.8,
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: "0.8rem",
          textTransform: "none",
          boxShadow: "0 4px 16px rgba(255, 0, 30, 0.25)",
          "&:hover": {
            backgroundColor: "linear-gradient(135deg, #d4001a, #b3001a)",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 20px rgba(255, 0, 30, 0.35)",
          },
          transition: "all 0.2s ease",
        }}
      >
        Connect
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

            {/* Wallet Display - Only show for logged-in users */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user && user.id && <WalletSection />}

              {user && user.id && (
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
              )}
            </Box>
          </>
        ) : (
          // Mobile Navigation
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Wallet Display for Mobile - Only show for logged-in users */}
            {user && user.id && <MobileWalletSection />}

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
