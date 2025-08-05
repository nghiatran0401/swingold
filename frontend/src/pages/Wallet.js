import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Stack, Chip, Alert, Divider, CircularProgress } from "@mui/material";
import { History, Send, GetApp, AccountBalanceWallet, CheckCircle, Link as LinkIcon } from "@mui/icons-material";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import { fetchTransactions, fetchUserBalance, requestWalletChallenge, verifyWalletSignature, updateWalletAddress } from "../api";
import { formatGold } from "../goldUtils";

const cardBase = {
  p: { xs: 3, sm: 4 },
  borderRadius: 4,
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
};

function Wallet({ logout }) {
  const [currentView, setCurrentView] = useState("main");
  const [userProfile, setUserProfile] = useState(null);
  const [onchainBalance, setOnchainBalance] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [walletStatus, setWalletStatus] = useState("");
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage when on mount
  useEffect(() => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserProfile(user);

    Promise.all([fetchUserBalance(user?.wallet_address), fetchTransactions(user?.id)])
      .then(([rawBalance, txs]) => {
        const formatted = formatGold(rawBalance);
        setOnchainBalance(formatted);
        setTransactionHistory(txs);
      })
      .catch((err) => setError(err.message));

    setLoading(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  // Top-level wallet connection status
  const isWalletConnected = !!userProfile?.wallet_address;
  const shortWallet = isWalletConnected ? `${userProfile.wallet_address.slice(0, 6)}...${userProfile.wallet_address.slice(-4)}` : null;

  const connectWallet = async () => {
    const updateWalletStatus = (status) => setWalletStatus(status);

    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask!");
      return;
    }

    try {
      setIsWalletLoading(true);
      updateWalletStatus("Connecting to MetaMask...");

      // Connect to MetaMask
      const [selectedAddress] = await window.ethereum.request({ method: "eth_requestAccounts" });
      updateWalletStatus("Wallet connected successfully!");

      // Request challenge from backend
      updateWalletStatus("Requesting challenge from server...");
      const challengeData = await requestWalletChallenge(selectedAddress);
      updateWalletStatus("Challenge received. Please sign with MetaMask...");

      // Ask MetaMask to sign the challenge
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(challengeData.challenge);
      updateWalletStatus("Signature created. Verifying...");

      // Send signature to backend for verification
      const verifyData = await verifyWalletSignature(selectedAddress, signature);

      // If verified, update updatedUser both to backend and localStorage
      if (verifyData.verified) {
        updateWalletStatus("Wallet verified! Updating profile...");
        const updatedUser = await updateWalletAddress(selectedAddress);
        setUserProfile(updatedUser);
<<<<<<< Updated upstream
        updateWalletStatus("Wallet linked to your profile!");
=======
        updateWalletStatus('Wallet linked to your profile!');
        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: '0xdFb76514c7bBB68CD6d2750052629106BbBD8C7B',
                        symbol: 'SG',
                        decimals: 18,
                        image: 'https://yourdomain.com/sg-icon.png',
                    },
                },
            });
        } catch (tokenAddError) {
            console.error('Token add to MetaMask failed:', tokenAddError);
        }
>>>>>>> Stashed changes
      } else {
        updateWalletStatus("Signature verification failed.");
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const renderMainView = () => (
    <Grid container spacing={4} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={5}>
        <Box sx={{ ...cardBase, textAlign: "center", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", px: 2 }}>
          <Box component="img" src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Gold Coin" sx={{ width: 120, height: 120, mb: 3 }} />
          <Typography variant="h2" sx={{ fontFamily: "Poppins", fontWeight: 800, color: "#2A2828", mb: 1 }}>
            {onchainBalance !== null ? `${onchainBalance} GOLD` : "-"}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#444" }}>
            On-chain Balance
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={7}>
        <Stack spacing={3}>
          <WalletButton label="View history" icon={<History />} onClick={() => setCurrentView("history")} />
          <WalletButton label="Give Gold" icon={<Send />} onClick={() => console.log("Give Gold clicked")} />
          <WalletButton label="Received" icon={<GetApp />} onClick={() => console.log("Received clicked")} />
        </Stack>
      </Grid>
    </Grid>
  );

  const renderStatisticsView = () => (
    <Grid container spacing={4} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ ...cardBase, textAlign: "center", minHeight: "400px" }}>
          <Typography variant="h5" sx={{ fontFamily: "Poppins", fontWeight: 700, color: "#2A2828", mb: 4 }}>
            Statistics
          </Typography>
          <Box
            sx={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `conic-gradient(#ff001e 0deg 270deg, #f0f0f0 270deg 360deg)`,
              mx: "auto",
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#2A2828" }}>
                75%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#ff001e", textAlign: "center" }}>
            % spend for events; items;
            <br />
            gift friends
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ ...cardBase, minHeight: "400px" }}>
          <Typography variant="h5" sx={{ fontFamily: "Poppins", fontWeight: 700, color: "#2A2828", mb: 3 }}>
            History
          </Typography>
          <Stack spacing={2}>
            {transactionHistory.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} />
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderHistoryView = () => (
    <Grid container spacing={4} alignItems="center" justifyContent="center">
      <Paper elevation={3} sx={{ ...cardBase }}>
        <Typography variant="h4" sx={{ fontFamily: "Poppins", fontWeight: 700, color: "#2A2828", mb: 4 }}>
          Transaction History
        </Typography>
        <Stack spacing={3}>
          {transactionHistory.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} detailed />
          ))}
        </Stack>
      </Paper>
    </Grid>
  );

  const TransactionCard = ({ tx, detailed }) => (
    <Paper
      elevation={detailed ? 2 : 1}
      sx={{ p: detailed ? 4 : 3, borderRadius: 3, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef", transition: "all 0.3s ease", "&:hover": { boxShadow: detailed ? "0 4px 12px rgba(0,0,0,0.1)" : "none" } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant={detailed ? "h5" : "h6"} sx={{ fontFamily: "Poppins", fontWeight: 600, color: tx.direction === "credit" ? "#4caf50" : "#ff001e", fontSize: detailed ? "24px" : "18px", mb: 1 }}>
            {tx.direction === "credit" ? "+" : "-"}
            {tx.amount}
          </Typography>
          <Typography variant={detailed ? "body1" : "body2"} sx={{ fontFamily: "Poppins", color: "#666", fontSize: detailed ? "14px" : "12px", lineHeight: 1.5 }}>
            {tx.created_at ? new Date(tx.created_at).toLocaleString() : ""}
            <br />
            {tx.description}
          </Typography>
          {tx.tx_hash && (
            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#888" }}>
              Tx: {tx.tx_hash}
            </Typography>
          )}
          {tx.status && <Chip label={tx.status} size="small" sx={{ ml: 1, backgroundColor: tx.status === "confirmed" ? "#4caf50" : tx.status === "failed" ? "#ff001e" : "#ffb300", color: "#fff" }} />}
        </Box>
      </Box>
    </Paper>
  );

  const WalletButton = ({ label, icon, onClick }) => (
    <Button
      variant="contained"
      fullWidth
      onClick={onClick}
      startIcon={icon}
      sx={{
        py: 2.5,
        fontSize: "16px",
        fontWeight: 600,
        fontFamily: "Poppins",
        borderRadius: 3,
        textTransform: "none",
        backgroundColor: "#fff",
        color: "#2A2828",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          backgroundColor: "#f8f8f8",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <>
      <Navbar logout={logout} />

      {loading && (
        <Box sx={{ position: "fixed", top: 64, left: 0, width: "100%", zIndex: 2000, bgcolor: "rgba(255,255,255,0.7)", textAlign: "center", py: 2 }}>
          <Typography variant="body1">Loading items...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ position: "fixed", top: 64, left: 0, width: "100%", zIndex: 2000, bgcolor: "#ffebee", textAlign: "center", py: 2 }}>
          <Typography variant="body1" color="error">
            Error: {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ backgroundColor: "#f3f3f3", minHeight: "100vh", pt: 10, pb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Poppins",
            fontWeight: "700",
            color: "#2A2828",
            mb: 3,
            textAlign: "center",
          }}
        >
          My Wallet
        </Typography>
        <Box sx={{ maxWidth: 1100, mx: "auto", p: 4, backgroundColor: "#fff", borderRadius: "16px" }}>
          {/* Top-level wallet connection status */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
            {isWalletConnected ? (
              <Chip
                icon={<CheckCircle />}
                label={`Connected: ${shortWallet}`}
                color="success"
                variant="filled"
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  py: 2,
                  px: 2,
                  backgroundColor: "rgba(76, 175, 80, 0.9)",
                  color: "white",
                  "& .MuiChip-icon": { fontSize: "18px", color: "white" },
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={connectWallet}
                disabled={isWalletLoading}
                startIcon={isWalletLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <AccountBalanceWallet />}
                sx={{
                  background: isWalletLoading ? "linear-gradient(45deg, #9E9E9E 30%, #757575 90%)" : "linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)",
                  border: 0,
                  borderRadius: 3,
                  boxShadow: isWalletLoading ? "0 2px 8px rgba(158, 158, 158, 0.3)" : "0 3px 15px rgba(255, 107, 107, 0.4)",
                  color: "white",
                  height: 56,
                  padding: "0 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textTransform: "none",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background: isWalletLoading ? "linear-gradient(45deg, #9E9E9E 30%, #757575 90%)" : "linear-gradient(45deg, #FF5252 30%, #26C6DA 90%)",
                    boxShadow: isWalletLoading ? "0 2px 8px rgba(158, 158, 158, 0.3)" : "0 4px 20px rgba(255, 82, 82, 0.5)",
                    transform: isWalletLoading ? "none" : "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(45deg, #9E9E9E 30%, #757575 90%)",
                    color: "rgba(255, 255, 255, 0.7)",
                    cursor: "not-allowed",
                  },
                }}
              >
                <Typography variant="button" fontWeight="bold">
                  {isWalletLoading ? "Connecting..." : "Connect Wallet"}
                </Typography>
              </Button>
            )}
          </Box>

          {/* Only show wallet features if connected */}
          {isWalletConnected && (
            <>
              <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                {[
                  { label: "Wallet", view: "main" },
                  { label: "Statistics", view: "statistics" },
                ].map(({ label, view }) => (
                  <Button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    variant={currentView === view ? "contained" : "outlined"}
                    sx={{
                      fontFamily: "Poppins",
                      textTransform: "none",
                      backgroundColor: currentView === view ? "#ff001e" : "transparent",
                      borderColor: "#ff001e",
                      color: currentView === view ? "#ffffff" : "#ff001e",
                      minWidth: 120,
                      fontWeight: 600,
                      boxShadow: currentView === view ? "0 3px 6px rgba(0,0,0,0.2)" : "none",
                      "&:hover": {
                        backgroundColor: currentView === view ? "#d4001a" : "rgba(255, 0, 30, 0.08)",
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
              {currentView === "main" && renderMainView()}
              {currentView === "history" && renderHistoryView()}
              {currentView === "statistics" && renderStatisticsView()}
            </>
          )}

          {/* Wallet status messages */}
          {walletStatus && (
            <Alert
              severity={walletStatus.includes("Error") ? "error" : walletStatus.includes("linked") ? "success" : "info"}
              sx={{
                mt: 3,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#2A2828",
                "& .MuiAlert-icon": { color: "#2A2828" },
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="body2">{walletStatus}</Typography>
            </Alert>
          )}
        </Box>
      </Box>
    </>
  );
}

export default Wallet;
