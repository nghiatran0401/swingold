import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Stack } from "@mui/material";
import { History, Send, GetApp } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { fetchTransactions, fetchUserBalance } from "../api";

function Wallet({ logout }) {
  const [currentView, setCurrentView] = useState("main");
  const [goldBalance, setGoldBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUserBalance(1), fetchTransactions(1)])
      .then(([balance, txs]) => {
        setGoldBalance(balance);
        setTransactionHistory(txs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cardBase = {
    p: { xs: 3, sm: 4 },
    borderRadius: 4,
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
  };
// Displaying current gold balance box

  const renderMainView = () => (
    <Grid container spacing={4} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={5}>
        <Box sx={{ ...cardBase, textAlign: "center", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", px: 2 }}>
          <Box component="img" src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Gold Coin" sx={{ width: 120, height: 120, mb: 3 }} />
          <Typography variant="h2" sx={{ fontFamily: "Poppins", fontWeight: 800, color: "#2A2828", mb: 1 }}>
            {goldBalance}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#444" }}>
            Gold
          </Typography>
        </Box>
      </Grid>

          {/* History, Give Gold and Received Gold Button */}

      <Grid item xs={12} md={7}>
        <Stack spacing={3}>
          <WalletButton label="View history" icon={<History />} onClick={() => setCurrentView("history")} />
          <WalletButton label="Give Gold" icon={<Send />} onClick={() => console.log("Give Gold clicked")} />
          <WalletButton label="Received" icon={<GetApp />} onClick={() => console.log("Received clicked")} />
        </Stack>
      </Grid>
    </Grid>
  );

  // View user's purchasing statistics (will be dynamic in )
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

      {/* Transaction History view */}

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
  // Transaction History Card that display single transaction
  const TransactionCard = ({ tx, detailed }) => (
    <Paper
      elevation={detailed ? 2 : 1}
      sx={{ p: detailed ? 4 : 3, borderRadius: 3, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef", transition: "all 0.3s ease", "&:hover": { boxShadow: detailed ? "0 4px 12px rgba(0,0,0,0.1)" : "none" } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant={detailed ? "h5" : "h6"} sx={{ fontFamily: "Poppins", fontWeight: 600, color: tx.amount > 0 ? "#4caf50" : "#ff001e", fontSize: detailed ? "24px" : "18px", mb: 1 }}>
            {tx.amount > 0 ? "+" : ""}
            {tx.amount}
          </Typography>
          <Typography variant={detailed ? "body1" : "body2"} sx={{ fontFamily: "Poppins", color: "#666", fontSize: detailed ? "14px" : "12px", lineHeight: 1.5 }}>
            {tx.date} {tx.description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  //  Wallet button

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

  // Error message to notify users
  if (loading) return <div>Loading wallet...</div>;
  if (error) return <div>Error: {error}</div>;


  // Wallet page view
  return (
    <>
      <Navbar logout={logout} />

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
        </Box>
      </Box>
    </>
  );
}

export default Wallet;
