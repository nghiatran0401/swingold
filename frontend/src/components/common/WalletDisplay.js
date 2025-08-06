import React from "react";
import { Box, Button, Typography, Chip, CircularProgress } from "@mui/material";
import { AccountBalanceWallet, ConnectWithoutContact } from "@mui/icons-material";
import { useWalletContext } from "../../contexts/WalletContext";
import { COLORS } from "../../constants";

const WalletDisplay = React.memo(
  ({
    variant = "default", // 'default', 'compact', 'minimal'
    showConnectButton = true,
    showBalance = true,
    showAddress = true,
    onConnectClick,
    sx = {},
  }) => {
    const { isConnected, isConnecting, error, connect, disconnect, displayInfo } = useWalletContext();

    const handleConnect = async () => {
      try {
        await connect();
        if (onConnectClick) onConnectClick();
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    if (variant === "minimal") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ...sx }}>
          {isConnected ? (
            <Chip icon={<AccountBalanceWallet />} label={displayInfo.formattedAddress} color="success" size="small" onClick={handleDisconnect} sx={{ cursor: "pointer" }} />
          ) : (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ConnectWithoutContact />}
              onClick={handleConnect}
              disabled={isConnecting}
              sx={{
                color: COLORS.primary,
                borderColor: COLORS.primary,
                "&:hover": {
                  borderColor: COLORS.primary,
                  backgroundColor: "rgba(255, 0, 30, 0.05)",
                },
              }}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </Box>
      );
    }

    if (variant === "compact") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ...sx }}>
          {isConnected ? (
            <>
              {showBalance && <Chip label={`${displayInfo.formattedTokenBalance} SWINGOLD`} color="primary" size="small" sx={{ fontWeight: 600 }} />}
              {showAddress && <Chip icon={<AccountBalanceWallet />} label={displayInfo.formattedAddress} variant="outlined" size="small" onClick={handleDisconnect} sx={{ cursor: "pointer" }} />}
            </>
          ) : (
            showConnectButton && (
              <Button
                size="small"
                variant="contained"
                startIcon={<ConnectWithoutContact />}
                onClick={handleConnect}
                disabled={isConnecting}
                sx={{
                  background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.primary}dd)`,
                  "&:hover": {
                    background: `linear-gradient(45deg, ${COLORS.primary}dd, ${COLORS.primary}bb)`,
                  },
                }}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )
          )}
        </Box>
      );
    }

    // Default variant
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, ...sx }}>
        {isConnected ? (
          <>
            {showBalance && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.secondary,
                    fontWeight: 600,
                    fontFamily: "Poppins",
                  }}
                >
                  Balance:
                </Typography>
                <Chip label={displayInfo.isLoading ? <CircularProgress size={16} color="inherit" /> : `${displayInfo.formattedTokenBalance} SWINGOLD`} color="primary" sx={{ fontWeight: 600 }} />
              </Box>
            )}

            {showAddress && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccountBalanceWallet sx={{ color: COLORS.success }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.secondary,
                    fontWeight: 600,
                    fontFamily: "Poppins",
                  }}
                >
                  {displayInfo.formattedAddress}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleDisconnect}
                  sx={{
                    color: COLORS.error,
                    borderColor: COLORS.error,
                    fontSize: "0.75rem",
                    py: 0.5,
                    px: 1,
                    "&:hover": {
                      borderColor: COLORS.error,
                      backgroundColor: "rgba(244, 67, 54, 0.05)",
                    },
                  }}
                >
                  Disconnect
                </Button>
              </Box>
            )}
          </>
        ) : (
          showConnectButton && (
            <Button
              variant="contained"
              startIcon={<ConnectWithoutContact />}
              onClick={handleConnect}
              disabled={isConnecting}
              sx={{
                background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.primary}dd)`,
                color: "white",
                fontWeight: 600,
                fontFamily: "Poppins",
                "&:hover": {
                  background: `linear-gradient(45deg, ${COLORS.primary}dd, ${COLORS.primary}bb)`,
                },
              }}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )
        )}

        {error && (
          <Typography
            variant="caption"
            sx={{
              color: COLORS.error,
              fontFamily: "Poppins",
              fontSize: "0.75rem",
            }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }
);

WalletDisplay.displayName = "WalletDisplay";

export default WalletDisplay;
