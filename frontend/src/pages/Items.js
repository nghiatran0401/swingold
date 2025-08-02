import React, { useState, useEffect } from "react";
import { fetchItems, recordOnchainPurchase, fetchUserBalance } from "../api";
import Navbar from "../components/Navbar";
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
} from "@mui/material";
import { Search, FilterList, AccountBalanceWallet } from "@mui/icons-material";
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
  const [confirming, setConfirming] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [onchainBalance, setOnchainBalance] = useState(null);
  const [rawBalance, setRawBalance] = useState(null);
  const [walletStatus, setWalletStatus] = useState("");

  // Fetch items on mount
  // TODO: get balance on this component temporarily, should be globally
  // come back to this later
  useEffect(() => {
    setLoading(true);
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userObj);
    setWalletAddress(userObj?.wallet_address || "");

    fetchItems()
      .then((data) => {
        console.log("Fetched items:", data);
        console.log(
          "Items with descriptions:",
          data.filter((item) => item.description)
        );
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

  const handleViewDetails = (itemId) => {
    const item = filteredAndSortedItems.find((i) => i.id === itemId);
    console.log("Selected item:", item);
    setSelectedItem(item);
    setSelectedSize("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setSelectedSize("");
  };

  // Wallet state
  const [walletAddress, setWalletAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isTxLoading, setIsTxLoading] = useState(false);

  // TODO: 1st version of working, not best practice, will refactor later
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
      setPurchased(true);

      // 5. Update balance after purchase
      const newRaw = await fetchUserBalance(walletAddress);
      setRawBalance(newRaw);
      const formattedNew = formatGold(newRaw);
      setOnchainBalance(formattedNew);
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

      {/* View all items button */}
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pt: 10, pb: 4 }}>
        <Box className="max-w-7xl mx-auto px-4">
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
            All Items
          </Typography>

          {/* Search and SortBy */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              px: { xs: 2, sm: 4, md: 14 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                width: "100%",
                maxWidth: 1200,
              }}
            >
              <TextField
                fullWidth
                placeholder="Find your items"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "#666", mr: 1 }} />,
                }}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "Poppins",
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#ff001e" },
                    "&.Mui-focused fieldset": { borderColor: "#ff001e" },
                  },
                }}
              />

              {/*  Sort By button */}
              <FormControl fullWidth sx={{ minWidth: { sm: 180 }, borderRadius: 2 }}>
                <InputLabel sx={{ fontFamily: "Poppins" }}>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<FilterList sx={{ color: "#666", mr: 1 }} />}
                  sx={{
                    fontFamily: "Poppins",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ff001e" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ff001e" },
                  }}
                >
                  <MenuItem value="price-low">Price: High to Low</MenuItem>
                  <MenuItem value="price-high">Price: Low to High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Wallet section */}
          {renderWalletSection()}

          {/* Items Grid */}
          <Box sx={{ mx: "auto", py: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              {filteredAndSortedItems.map((item) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={item.id}>
                  <Paper
                    elevation={3}
                    onClick={() => handleViewDetails(item.id)}
                    sx={{
                      height: { xs: 380, sm: 420, md: 460 },
                      width: { xs: 200, sm: 240, md: 280 },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                      borderRadius: 4,
                      overflow: "hidden",
                      position: "relative",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        height: "50%",
                        backgroundColor: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid #eee",
                        px: 2,
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "50%",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#222",
                          fontFamily: "Poppins",
                          textAlign: "center",
                          mb: 0.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {/*  Price of item */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "#ff001e",
                          fontFamily: "Poppins",
                          textAlign: "center",
                          fontSize: "1rem",
                          mb: 1,
                        }}
                      >
                        {item.price} GOLD
                      </Typography>
                      {/* Description */}
                      {item.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            fontFamily: "Poppins",
                            textAlign: "center",
                            fontSize: "0.8rem",
                            mb: 1,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                          handleViewDetails(item.id);
                        }}
                        sx={{
                          alignSelf: "center",
                          px: 3,
                          backgroundColor: "#ff001e",
                          textTransform: "none",
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                          borderRadius: "999px",
                          "&:hover": {
                            backgroundColor: "#d4001a",
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
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
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, backgroundColor: "#f5f5f5" } }}>
          {/* Display the chosen item, with detailed description */}
          {selectedItem && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>{selectedItem.name}</Typography>
                </Box>
              </DialogTitle>

              <DialogContent>
                <Grid
                  container
                  spacing={3}
                  wrap="nowrap"
                  sx={{
                    flexDirection: { xs: "row", sm: "row" },
                    overflowX: "auto",
                  }}
                >
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        maxHeight: 300,
                        backgroundColor: "#e0e0e0",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedItem.price} GOLD
                      </Typography>

                      {selectedItem.description && (
                        <Typography variant="body1" sx={{ color: "#555", fontFamily: "Poppins", lineHeight: 1.6 }}>
                          {selectedItem.description}
                        </Typography>
                      )}

                      {/* Item size selection */}
                      {selectedItem.tags &&
                        (() => {
                          try {
                            // Try to parse as JSON first (for size arrays)
                            const sizes = JSON.parse(selectedItem.tags);
                            if (Array.isArray(sizes) && sizes.length > 0) {
                              return (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#2A2828", mb: 2 }}>
                                    Select Size:
                                  </Typography>
                                  <FormControl component="fieldset">
                                    <RadioGroup value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} row>
                                      {sizes.map((size) => (
                                        <FormControlLabel
                                          key={size}
                                          value={size}
                                          control={<Radio />}
                                          label={size}
                                          sx={{
                                            "& .MuiFormControlLabel-label": {
                                              fontFamily: "Poppins",
                                              fontWeight: 500,
                                            },
                                          }}
                                        />
                                      ))}
                                    </RadioGroup>
                                  </FormControl>
                                </Box>
                              );
                            }
                          } catch (e) {
                            // If JSON parsing fails, treat as regular tags (comma-separated)
                            const tags = selectedItem.tags
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter((tag) => tag);
                            if (tags.length > 0) {
                              return (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#2A2828", mb: 2 }}>
                                    Tags:
                                  </Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {tags.map((tag) => (
                                      <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        sx={{
                                          backgroundColor: "#f0f0f0",
                                          color: "#666",
                                          fontFamily: "Poppins",
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              );
                            }
                          }
                          return null;
                        })()}
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>

              {/* Purchase button */}
              <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                <Button onClick={handleCloseDialog} color="inherit">
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setConfirming(true)}
                  disabled={(() => {
                    if (!selectedItem.tags) return false;
                    try {
                      const sizes = JSON.parse(selectedItem.tags);
                      return Array.isArray(sizes) && sizes.length > 0 && !selectedSize;
                    } catch (e) {
                      return false; // If not JSON, don't require size selection
                    }
                  })()}
                  sx={{
                    backgroundColor: "#ff001e",
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1.2,
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#d4001a",
                    },
                    "&:disabled": { backgroundColor: "#ccc" },
                  }}
                >
                  Purchase
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* If purchased -> show transaction details */}
        <Dialog open={confirming} onClose={() => setConfirming(false)}>
          {!purchased ? (
            <>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <div style={{ whiteSpace: "pre-line" }}>
                    Product: {selectedItem?.name}
                    {"\n"}
                    Amount: 1{"\n"}
                    Total: {selectedItem?.price} GOLD{"\n\n"}
                    {walletAddress ? `Wallet: ${walletAddress}` : "Wallet not connected"}
                  </div>
                </DialogContentText>
                {txStatus && (
                  <Alert severity={txStatus.startsWith("Transaction failed") ? "error" : "info"} sx={{ mt: 2 }}>
                    {txStatus}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirming(false)}>Cancel</Button>
                <Button
                  onClick={handlePurchase}
                  autoFocus
                  variant="contained"
                  disabled={isTxLoading}
                  sx={{
                    backgroundColor: "#ff001e",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#d4001a" },
                  }}
                >
                  {isTxLoading ? "Processing..." : "Confirm & Pay"}
                </Button>
              </DialogActions>
            </>
          ) : (
            <DialogContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                🎉 Purchase Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thank you for your purchase.
                <br />
                {txHash && (
                  <>
                    <br />
                    Transaction Hash: <span style={{ fontFamily: "monospace" }}>{txHash}</span>
                  </>
                )}
              </Typography>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </>
  );
}

export default Items;
