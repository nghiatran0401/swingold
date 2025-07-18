import React, { useState, useMemo, useEffect } from "react";
import { fetchItems, toggleItemFavorite } from "../api";
import Navbar from "../components/Navbar";
import { Grid, Paper, Box, Button, Typography, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Search, FilterList, Favorite, FavoriteBorder } from "@mui/icons-material";

function Items({ logout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [favorites, setFavorites] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Get Data from Item API

  useEffect(() => {
    setLoading(true);
    fetchItems(searchTerm)
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()));
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [items, searchTerm, sortBy]);

  const handleViewDetails = (itemId) => {
    const item = filteredAndSortedItems.find((i) => i.id === itemId);
    setSelectedItem(item);
  };

  
  const toggleFavorite = async (itemId) => {
    try {
      await toggleItemFavorite(itemId);
      setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
      // Optionally reload items
      fetchItems(searchTerm).then((data) => setItems(data));
    } catch (err) {
      setError(err.message);
    }
  };

  // Error message
  if (loading) return <div>Loading items...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Navbar logout={logout} />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    {/* Favorite */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      {favorites.includes(item.id) ? <Favorite sx={{ color: "#ff001e" }} /> : <FavoriteBorder sx={{ color: "#999" }} />}
                    </IconButton>

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
                        alt={item.alt || item.name}
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
                  <IconButton onClick={() => toggleFavorite(selectedItem.id)}>{favorites.includes(selectedItem.id) ? <Favorite sx={{ color: "#ff001e" }} /> : <FavoriteBorder />}</IconButton>
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
                    Username: Tran Van A{"\n"}
                    Address: 0x123456789
                    {"\n"}
                    Email: a@gmail.com
                    {"\n\n"}
                    Product: {selectedItem?.name}
                    {"\n"}
                    Amount: 1{"\n"}
                    Total: {selectedItem?.price}${"\n\n"}
                    Date: 06/06/2025
                    {"\n"}
                    Time: 10:00:00
                  </div>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirming(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    setPurchased(true);
                    setTimeout(() => {
                      setConfirming(false);
                      setSelectedItem(null);
                      setSelectedSize("");
                    }, 1200);
                  }}
                  autoFocus
                  variant="contained"
                  sx={{
                    backgroundColor: "#ff001e",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#d4001a" },
                  }}
                >
                  Confirm
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
              </Typography>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </>
  );
}

export default Items;
