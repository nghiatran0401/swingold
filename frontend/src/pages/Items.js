import React, { useState, useMemo, useEffect } from "react";
import { fetchItems, recordOnchainPurchase } from "../api";
import Navbar from "../components/Navbar";
import { Grid, Paper, Box, Button, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { ethers } from "ethers";

// TODO: come back to this later

function Items({ logout }) {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filteredAndSortedItems, setFilteredAndSortedItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items on mount
  useEffect(() => {
    setLoading(true);
    fetchItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Combined debounced search and sort
  useEffect(() => {
    const handler = debounce((searchValue) => {
      let processed = items;

      // Search items
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
    setSelectedItem(item);
  };

  // Wallet state
  const [walletAddress, setWalletAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isTxLoading, setIsTxLoading] = useState(false);

  // On-chain purchase handler
  const handlePurchase = async () => {
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
    setIsTxLoading(true);
    setTxStatus("");
    try {
      // Example: Assume you have the contract ABI and address
      const contractAddress = process.env.REACT_APP_TRADE_MANAGER_ADDRESS;
      const contractABI = JSON.parse(process.env.REACT_APP_TRADE_MANAGER_ABI || "[]");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // Send the transaction (replace with your contract's method)
      const tx = await contract.createTrade(
        walletAddress, // seller (or use a real seller address)
        selectedItem.name,
        ethers.parseUnits(selectedItem.price.toString(), 18) // adjust decimals as needed
      );
      setTxStatus("Transaction sent. Waiting for confirmation...");
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setTxStatus("Transaction confirmed!");
      // Send tx hash and purchase info to backend
      await recordOnchainPurchase({
        item_id: selectedItem.id,
        price: selectedItem.price,
        tx_hash: receipt.hash,
        wallet_address: walletAddress,
        size: selectedSize,
      });
      setPurchased(true);
      // Save wallet address to localStorage for persistence
      localStorage.setItem("walletAddress", walletAddress);
    } catch (err) {
      setTxStatus("Transaction failed: " + (err?.message || err?.toString() || "Unknown error"));
    } finally {
      setIsTxLoading(false);
    }
  };

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

              {/*  Sort By  button */}
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
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Items Grid */}
          <Box sx={{ mx: "auto", py: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              {filteredAndSortedItems.map((item) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={item.id}>
                  <Paper
                    elevation={3}
                    onClick={() => handleViewDetails(item.id)}
                    sx={{
                      height: { xs: 320, sm: 360, md: 400 },
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
                        src={item.image}
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
                        {item.price} Gold
                      </Typography>
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
        <Dialog
          open={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setSelectedSize("");
            setPurchased(false);
          }}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4, backgroundColor: "#f5f5f5" } }}
        >
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
                      <img src={selectedItem.image} alt={selectedItem.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedItem.price}$
                      </Typography>

                      <DialogContentText sx={{ color: "#555" }}>{selectedItem.description || "Product Description. swinburne t shirt, 3 sizes....."}</DialogContentText>

                      {/* Item size selection */}
                      {selectedItem.size && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Size
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {selectedItem.size.map((size) => (
                              <Box
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                sx={{
                                  px: 2,
                                  py: 1,
                                  cursor: "pointer",
                                  backgroundColor: selectedSize === size ? "#ff001e" : "#ddd",
                                  color: selectedSize === size ? "#fff" : "#000",
                                  borderRadius: 1,
                                  fontWeight: 500,
                                  fontSize: "0.9rem",
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                {size}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>

              {/* Purchase button */}
              <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setConfirming(true)}
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
                    Total: {selectedItem?.price}${"\n\n"}
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
