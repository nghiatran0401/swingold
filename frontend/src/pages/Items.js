import React, { useState, useEffect } from "react";
import { fetchItems, recordOnchainPurchase, fetchUserBalance } from "../api";
import { Navbar } from "../components";
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Slide,
} from "@mui/material";
import { Search, FilterList, AccountBalanceWallet } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import debounce from "lodash.debounce";
import { ethers } from "ethers";
import { formatGold } from "../goldUtils";
import TradeManagerABI from "../shared-abis/TradeManagerABI.json";
import SwingoldABI from "../shared-abis/SwingoldABI.json";

function Items({ logout }) {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [filteredAndSortedItems, setFilteredAndSortedItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [onchainBalance, setOnchainBalance] = useState(null);
  const [rawBalance, setRawBalance] = useState(null);
  const [walletStatus, setWalletStatus] = useState("");
  const [purchaseError, setPurchaseError] = useState("");

  // Fetch items on mount
  useEffect(() => {
    setLoading(true);
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userObj);
    setWalletAddress(userObj?.wallet_address || "");

    fetchItems()
      .then((data) => {
        setItems(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    if (userObj?.wallet_address) {
      fetchUserBalance(userObj.wallet_address)
        .then((raw) => {
          setRawBalance(raw);
          const formatted = formatGold(raw);
          setOnchainBalance(formatted);
        })
        .catch(() => setOnchainBalance(null));
    }
  }, []);

  // Combined debounced search and sort
  useEffect(() => {
    const handler = debounce((searchValue) => {
      let processed = items;

      if (searchValue) {
        processed = processed.filter((item) => item.name.toLowerCase().includes(searchValue.toLowerCase()) || (item.description || "").toLowerCase().includes(searchValue.toLowerCase()));
      }

      // Sort items
      processed.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          default:
            return a.name.localeCompare(b.name);
        }
      });

      setFilteredAndSortedItems(processed);
    }, 300);

    handler(searchInput);
    return () => handler.cancel();
  }, [searchInput, items, sortBy]);

  const handlePurchaseClick = (item) => {
    setSelectedItem(item);
    setSelectedSize("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setSelectedSize("");
    setPurchaseError("");
  };

  const handleConfirmPurchase = async () => {
    setPurchaseError("");

    // Wallet checks
    if (!window.ethereum) {
      setPurchaseError("MetaMask not detected. Please install MetaMask!");
      return;
    }
    if (!walletAddress) {
      setPurchaseError("Please connect your wallet first.");
      return;
    }
    if (!selectedItem) {
      setPurchaseError("No item selected.");
      return;
    }
    if (Number(rawBalance) < Number(selectedItem.price) * 1e18) {
      setPurchaseError("Insufficient balance to purchase this item.");
      return;
    }

    // If all checks pass, proceed with purchase
    await handlePurchase();
  };

  // Wallet state
  const [walletAddress, setWalletAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isTxLoading, setIsTxLoading] = useState(false);

  const handlePurchase = async () => {
    // MetaMask/Wallet Checks
    if (!window.ethereum) {
      setTxStatus("MetaMask not detected. Please install MetaMask!");
      return;
    }
    if (!walletAddress) {
      setTxStatus("Please connect your wallet first.");
      return;
    }
    if (!selectedItem) {
      setTxStatus("No item selected.");
      return;
    }
    if (Number(rawBalance) < Number(selectedItem.price) * 1e18) {
      setTxStatus("Insufficient balance to purchase this item.");
      return;
    }

    setIsTxLoading(true);
    setTxStatus("");

    try {
      // Prepare for Transaction
      const contractAddress = process.env.REACT_APP_TRADE_MANAGER_ADDRESS;
      const tokenAddress = process.env.REACT_APP_SWINGOLD_ADDRESS;
      const contractABI = TradeManagerABI;
      const swingoldABI = SwingoldABI;

      // Create Contract Instances
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const token = new ethers.Contract(tokenAddress, swingoldABI, signer);

      const price = ethers.parseUnits(selectedItem.price.toString(), 18);
      const sellerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      // 1. Approve Token Spend
      setTxStatus("Approving token spend...");
      const approveTx = await token.approve(contractAddress, price);
      await approveTx.wait();

      // 2. Create trade
      setTxStatus("Creating trade...");
      const createTx = await contract.createTrade(sellerAddress, selectedItem.name, price);
      const createReceipt = await createTx.wait();

      // Extract tradeId from TradeCreated event
      let tradeId = null;
      for (const log of createReceipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed.name === "TradeCreated") {
            tradeId = parsed.args[0].toString();
            break;
          }
        } catch {}
      }
      if (!tradeId) throw new Error("Failed to get tradeId from event");

      // 3. Confirm trade (moves tokens)
      setTxStatus("Confirming trade...");
      const confirmTx = await contract.confirmTrade(tradeId);
      const confirmReceipt = await confirmTx.wait();
      setTxHash(confirmReceipt.hash);
      setTxStatus("Transaction confirmed!");

      // 4. Record purchase in backend
      await recordOnchainPurchase({
        item_id: selectedItem.id,
        price: selectedItem.price,
        tx_hash: confirmReceipt.hash,
        wallet_address: user?.wallet_address,
        quantity: 1,
      });

      // 5. Update balance after purchase
      const newRaw = await fetchUserBalance(walletAddress);
      setRawBalance(newRaw);
      const formattedNew = formatGold(newRaw);
      setOnchainBalance(formattedNew);

      // 6. Close dialog and show success
      setTimeout(() => {
        setDialogOpen(false);
        setSelectedItem(null);
        setSelectedSize("");
        setTxStatus("");
        setTxHash("");
      }, 2000);
    } catch (err) {
      setTxStatus("Transaction failed: " + (err?.message || err?.toString() || "Unknown error"));
    } finally {
      setIsTxLoading(false);
    }
  };

  // Wallet section UI
  const renderWalletSection = () => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, minWidth: 320, display: "flex", alignItems: "center", gap: 3, background: "#fffbe6" }}>
        <AccountBalanceWallet sx={{ fontSize: 40, color: "#ffb300" }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontFamily: "Poppins", color: "#888" }}>
            Wallet
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 700 }}>
              {`${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#ff001e", fontWeight: 600, mt: 0.5 }}>
            {onchainBalance !== null ? `${onchainBalance} GOLD` : "-"}
          </Typography>
        </Box>
      </Paper>
      {walletStatus && (
        <Alert severity="info" sx={{ ml: 2 }}>
          {walletStatus}
        </Alert>
      )}
    </Box>
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

      {/* Main Content */}
      <Box
        sx={{
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #ff001e 0%, #d4001a 100%)",
            height: "500px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
              opacity: 0.3,
              animation: "float 6s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-10px)" },
              },
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              width: "100%",
              maxWidth: "800px",
              px: 4,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: "Poppins",
                fontWeight: "900",
                color: "#ffffff",
                mb: 3,
                fontSize: { xs: "3rem", md: "4.5rem" },
                textShadow: "0 4px 8px rgba(0,0,0,0.2)",
                letterSpacing: "-0.02em",
                animation: "fadeInUp 0.8s ease-out",
                "@keyframes fadeInUp": {
                  "0%": {
                    opacity: 0,
                    transform: "translateY(30px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              🛍️ All Items
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontFamily: "Poppins",
                fontWeight: "400",
                color: "rgba(255,255,255,0.95)",
                mb: 6,
                fontSize: "1.3rem",
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.5,
              }}
            >
              Discover amazing products at Swinburne
            </Typography>
          </Box>
        </Box>

        {/* Floating Search and Filter Section */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            mt: -8,
            mb: 8,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(255, 0, 30, 0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              maxWidth: "1200px",
              mx: "auto",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 25px 80px rgba(0,0,0,0.15), 0 0 60px rgba(255, 0, 30, 0.15)",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{
                width: "100%",
              }}
            >
              <TextField
                fullWidth
                placeholder="Find your items..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "#666", mr: 1 }} />,
                }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.8)",
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    fontSize: "1.1rem",
                    backdropFilter: "blur(10px)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                    "& input": {
                      color: "#2A2828",
                      "&::placeholder": {
                        color: "#666",
                        opacity: 1,
                      },
                    },
                  },
                }}
              />

              {/* Sort By button */}
              <FormControl sx={{ minWidth: { sm: 250 } }}>
                <InputLabel sx={{ fontFamily: "Poppins" }}>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<FilterList sx={{ color: "#666", mr: 1 }} />}
                  sx={{
                    fontFamily: "Poppins",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
                      borderWidth: "2px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ff001e",
                    },
                  }}
                >
                  <MenuItem value="price-low">Price: High to Low</MenuItem>
                  <MenuItem value="price-high">Price: Low to High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Box>

        {/* Wallet section */}
        {/* <Box sx={{ mb: 6 }}>{renderWalletSection()}</Box> */}

        {/* Items Grid */}
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            px: 4,
            pb: 8,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              justifyContent: { xs: "center", md: "flex-start" },
              width: "100%",
            }}
          >
            {filteredAndSortedItems.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: "0 0 calc(33.333% - 16px)",
                  minWidth: { xs: "280px", sm: "300px" },
                  maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: { xs: 400, sm: 440, md: 480 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    borderRadius: "24px",
                    overflow: "hidden",
                    position: "relative",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    cursor: "pointer",
                    width: "100%",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: "linear-gradient(90deg, #ff001e, #d4001a)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 20px 40px rgba(255, 0, 30, 0.1)",
                      borderColor: "#ff001e",
                      "&::before": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      height: "55%",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1px solid #eee",
                      px: 2,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(45deg, rgba(255, 0, 30, 0.1), rgba(212, 0, 26, 0.1))",
                        zIndex: 1,
                      },
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "16px 16px 0 0",
                      }}
                    />
                    {/* Price Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 2,
                      }}
                    >
                      <Chip
                        label={`${item.price} GOLD`}
                        sx={{
                          background: "linear-gradient(45deg, #ff001e, #d4001a)",
                          color: "#ffffff",
                          fontFamily: "Poppins",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "45%",
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "700",
                        color: "#2A2828",
                        fontFamily: "Poppins",
                        textAlign: "center",
                        mb: 2,
                        fontSize: "1.2rem",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </Typography>
                    {/* Description */}
                    {item.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontFamily: "Poppins",
                          textAlign: "center",
                          fontSize: "0.9rem",
                          mb: 2,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                    {/* View Detail button */}
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchaseClick(item);
                      }}
                      sx={{
                        alignSelf: "center",
                        px: 4,
                        py: 1.5,
                        background: "linear-gradient(45deg, #ff001e, #d4001a)",
                        textTransform: "none",
                        fontFamily: "Poppins",
                        fontWeight: "600",
                        fontSize: "1rem",
                        borderRadius: "16px",
                        boxShadow: "0 6px 20px rgba(255, 0, 30, 0.3)",
                        transition: "all 0.3s ease",
                        mt: "auto",
                        "&:hover": {
                          background: "linear-gradient(45deg, #d4001a, #b30017)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(255, 0, 30, 0.4)",
                        },
                      }}
                    >
                      💳 Purchase Now
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>

        {/* No Items */}
        {filteredAndSortedItems.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography variant="h6" sx={{ color: "#666", fontFamily: "Poppins", mb: 1 }}>
              No items found
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", fontFamily: "Poppins" }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          TransitionComponent={Slide}
          keepMounted
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "40px",
              backgroundColor: "#ffffff",
              boxShadow: "0 60px 160px rgba(0,0,0,0.25), 0 0 100px rgba(255, 0, 30, 0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              overflow: "hidden",
              position: "relative",
              maxHeight: "90vh",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,249,255,0.1) 100%)",
                pointerEvents: "none",
                zIndex: 0,
              },
            },
          }}
        >
          {/* Display the chosen item, with detailed description */}
          {selectedItem && (
            <>
              <DialogTitle
                sx={{
                  background: "linear-gradient(135deg, #ff001e 0%, #d4001a 100%)",
                  color: "#ffffff",
                  fontFamily: "Poppins",
                  fontWeight: "900",
                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                  textAlign: "center",
                  py: { xs: 3, sm: 4, md: 5 },
                  px: { xs: 4, sm: 5, md: 6 },
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
                    opacity: 0.4,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60px",
                    height: "4px",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
                    borderRadius: "2px",
                  },
                }}
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: "900",
                      fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                      textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      position: "relative",
                      zIndex: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    🛍️ Confirm Purchase
                  </Typography>
                </Box>
              </DialogTitle>

              <Box
                sx={{
                  py: { xs: 4, sm: 5, md: 6 },
                  px: { xs: 3, sm: 4, md: 5 },
                  textAlign: "center",
                  maxHeight: "60vh",
                  overflow: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 0, 30, 0.3)",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "rgba(255, 0, 30, 0.5)",
                    },
                  },
                }}
              >
                {/* Item Information Card */}
                {selectedItem && (
                  <Paper
                    elevation={0}
                    sx={{
                      backgroundColor: "#f8f9ff",
                      borderRadius: "16px",
                      p: 3,
                      mb: 4,
                      border: "1px solid #e3e8ff",
                      background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
                    }}
                  >
                    {/* Item Image */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "200px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        mb: 3,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          borderRadius: "12px",
                        }}
                      />
                      {/* Price Badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                      >
                        <Chip
                          label={`${selectedItem.price} GOLD`}
                          sx={{
                            background: "linear-gradient(45deg, #ff001e, #d4001a)",
                            color: "#ffffff",
                            fontFamily: "Poppins",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            boxShadow: "0 2px 8px rgba(255, 0, 30, 0.3)",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Item Details */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: "700",
                        color: "#2A2828",
                        mb: 2,
                        fontSize: { xs: "1.1rem", sm: "1.2rem" },
                      }}
                    >
                      {selectedItem.name}
                    </Typography>

                    {selectedItem.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Poppins",
                          color: "#666",
                          mb: 3,
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedItem.description}
                      </Typography>
                    )}

                    {/* Item Info Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        textAlign: "left",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "#666",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            mb: 0.5,
                          }}
                        >
                          💰 Price
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "#2A2828",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                          }}
                        >
                          {selectedItem.price} GOLD
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "#666",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            mb: 0.5,
                          }}
                        >
                          📦 Quantity
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "#2A2828",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                          }}
                        >
                          1 item
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* Confirmation Message */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } }} />
                  <Typography
                    sx={{
                      color: "#2A2828",
                      fontFamily: "Poppins",
                      lineHeight: 1.8,
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.15rem" },
                      fontWeight: "600",
                    }}
                  >
                    Are you sure you want to purchase this item?
                  </Typography>
                </Box>

                {/* Error Display */}
                {purchaseError && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {purchaseError}
                  </Alert>
                )}

                {/* Transaction Status */}
                {txStatus && (
                  <Alert severity={txStatus.startsWith("Transaction failed") ? "error" : "info"} sx={{ mt: 2, mb: 2 }}>
                    {txStatus}
                  </Alert>
                )}
              </Box>

              <DialogActions
                sx={{
                  justifyContent: "center",
                  pb: { xs: 4, sm: 5, md: 6 },
                  pt: { xs: 2, sm: 3, md: 4 },
                  px: { xs: 3, sm: 4, md: 5 },
                  gap: { xs: 2, sm: 3 },
                }}
              >
                <Button
                  onClick={handleCloseDialog}
                  sx={{
                    fontFamily: "Poppins",
                    textTransform: "none",
                    borderRadius: "12px",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.2 },
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    border: "2px solid #e0e0e0",
                    color: "#666",
                    "&:hover": {
                      borderColor: "#ff001e",
                      color: "#ff001e",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmPurchase}
                  disabled={isTxLoading}
                  sx={{
                    background: "linear-gradient(45deg, #ff001e, #d4001a)",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.2 },
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, #d4001a, #b30017)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(255, 0, 30, 0.4)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                      transform: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  {isTxLoading ? "Processing..." : "Yes, Purchase"}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </>
  );
}

export default Items;
