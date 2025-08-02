import React, { useState, useMemo, useEffect } from "react";
import Navbar from "../components/Navbar";
import { fetchEvents, fetchAvailableMonths, toggleEventEnrollment } from "../api";
import { Grid, Paper, Box, Button, Typography, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";

// Helper function to convert YYYY-MM to month name
const convertToMonthName = (yearMonth) => {
  if (yearMonth === "All") return "All";
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [year, month] = yearMonth.split("-");
  const monthIndex = parseInt(month) - 1;
  return monthNames[monthIndex] || yearMonth;
};

// Helper function to convert month name to YYYY-MM format for comparison
const getMonthValue = (monthName) => {
  if (monthName === "All") return "All";
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = monthNames.indexOf(monthName);
  return monthIndex !== -1 ? String(monthIndex + 1).padStart(2, "0") : null;
};

function Events({ logout }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [months, setMonths] = useState(["All"]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [enrolledEvents, setEnrolledEvents] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEventId, setPendingEventId] = useState(null);
  const [registeredSeats, setRegisteredSeats] = useState(0);

  // Fetch available months and events on mount
  useEffect(() => {
    setLoading(true);
    fetchEvents().then((e) => {
      console.log("Fetched events:", e);
      setEvents(e);
    });
    fetchAvailableMonths().then((m) => {
      const monthNames = m.map(convertToMonthName);
      setMonths(["All", ...monthNames]);
    });
    setLoading(false);
  }, []);

  // Combined filtering for both search and month selection
  useEffect(() => {
    let filtered = events;

    // Apply month filter first
    if (selectedMonth !== "All") {
      const selectedMonthValue = getMonthValue(selectedMonth);
      filtered = filtered.filter((event) => {
        if (event.start_datetime && selectedMonthValue) {
          const eventDate = new Date(event.start_datetime);
          const eventMonth = String(eventDate.getMonth() + 1).padStart(2, "0");
          return eventMonth === selectedMonthValue;
        }
        return false;
      });
    }

    // Apply search filter
    if (searchInput.trim()) {
      filtered = filtered.filter((event) => (event.name && event.name.toLowerCase().includes(searchInput.toLowerCase())) || (event.description && event.description.toLowerCase().includes(searchInput.toLowerCase())));
    }

    console.log("Filtered events:", filtered);
    setFilteredEvents(filtered);
  }, [selectedMonth, searchInput, events]);

  const handleEnrollClick = (eventId) => {
    setPendingEventId(eventId);
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingEventId(null);
  };

  // TODO: come back to this later
  const handleConfirm = async () => {
    if (pendingEventId !== null) {
      try {
        await toggleEventEnrollment(pendingEventId);
        setEnrolledEvents((prev) => ({ ...prev, [pendingEventId]: true }));
        setRegisteredSeats((prev) => prev + 1);
        // Optionally reload events
        fetchEvents().then((data) => setEvents(data));
      } catch (err) {
        setError(err.message);
      }
    }
    setConfirmOpen(false);
    setPendingEventId(null);
  };

  return (
    <>
      <Navbar logout={logout} />

      {loading && (
        <Box sx={{ position: "fixed", top: 64, left: 0, width: "100%", zIndex: 2000, bgcolor: "rgba(255,255,255,0.7)", textAlign: "center", py: 2 }}>
          <Typography variant="body1">Loading events...</Typography>
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
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          pt: 10,
          pb: 4,
        }}
      >
        <Box className="max-w-6xl mx-auto px-4">
          {/* Search and Month Filter */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Poppins",
                fontWeight: "700",
                color: "#2A2828",
                mb: 3,
              }}
            >
              {selectedMonth === "All" ? "All Events" : selectedMonth}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
              {months.map((month) => (
                <Chip
                  key={month}
                  label={month}
                  onClick={() => setSelectedMonth(month)}
                  sx={{
                    backgroundColor: selectedMonth === month ? "#ff001e" : "#ffffff",
                    color: selectedMonth === month ? "#ffffff" : "#2A2828",
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    "&:hover": {
                      backgroundColor: selectedMonth === month ? "#d4001a" : "#f0f0f0",
                    },
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              placeholder="Search events"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: "#666", mr: 1 }} />,
              }}
              sx={{
                my: 3,
                maxWidth: 640,
                backgroundColor: "#fff",
                borderRadius: 2,
                fontFamily: "Poppins",
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Poppins",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#ff001e" },
                  "&.Mui-focused fieldset": { borderColor: "#ff001e" },
                },
              }}
            />
          </Box>

          {/* Events List */}
          <Box sx={{ maxWidth: "800px", mx: "auto", bgcolor: "#fff", p: 6, borderRadius: "16px" }}>
            {filteredEvents.length === 0 ? (
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  color: "#666",
                  fontFamily: "Poppins",
                  mt: 4,
                }}
              >
                No events found for {selectedMonth}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid item xs={12} key={event.id} sx={{ width: "100%" }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: "#ffffff",
                        border: "1px solid #e0e0e0",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ mb: 2, textAlign: "center" }}>
                            <img src={event.image_url} alt={event.name} style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }} />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: "600",
                              color: "#2A2828",
                              mb: 1,
                              fontSize: "20px",
                            }}
                          >
                            {event.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "Poppins",
                              color: "#666",
                              mb: 2,
                              fontSize: "14px",
                            }}
                          >
                            Date: {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString() : "TBD"}
                          </Typography>

                          {event.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "Poppins",
                                color: "#555",
                                mb: 2,
                                lineHeight: 1.5,
                              }}
                            >
                              {event.description}
                            </Typography>
                          )}

                          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            {event.location && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#666",
                                  fontSize: "12px",
                                }}
                              >
                                📍 {event.location}
                              </Typography>
                            )}

                            {event.category && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#666",
                                  fontSize: "12px",
                                }}
                              >
                                🏷️ {event.category}
                              </Typography>
                            )}

                            {event.status && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#666",
                                  fontSize: "12px",
                                }}
                              >
                                ⚙️ {event.status}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ ml: 3, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <Chip
                            label={event.price === 0 ? "Free" : `${event.price.toFixed(2)} GOLD`}
                            clickable={false}
                            onClick={() => {}}
                            sx={{
                              backgroundColor: event.price === 0 ? "#e8f5e8" : "#ff001e",
                              color: event.price === 0 ? "#2e7d32" : "#ffffff",
                              fontFamily: "Poppins",
                              fontWeight: "600",
                              mb: 2,
                              minWidth: "80px",
                            }}
                          />

                          {event.end_datetime && (
                            <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#666", fontSize: "12px", mb: 1 }}>
                              Ends: {new Date(event.end_datetime).toLocaleDateString()}
                            </Typography>
                          )}
                          {event.seats_available && (
                            <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#666", fontSize: "12px", mb: 1 }}>
                              Seats: {event.seats_available}
                            </Typography>
                          )}
                          {event.tags && (
                            <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#666", fontSize: "12px", mb: 1 }}>
                              Tags: {event.tags}
                            </Typography>
                          )}

                          {event.end ? (
                            <Button
                              disabled
                              variant="outlined"
                              sx={{
                                fontFamily: "Poppins",
                                textTransform: "none",
                                borderColor: "#ccc",
                                color: "#999",
                              }}
                            >
                              Ended
                            </Button>
                          ) : enrolledEvents[event.id] ? (
                            <Button
                              variant="contained"
                              startIcon={<CheckCircleIcon />}
                              sx={{
                                backgroundColor: "#4caf50",
                                fontFamily: "Poppins",
                                textTransform: "none",
                                animation: "pulse 0.6s ease-out",
                                "@keyframes pulse": {
                                  "0%": { transform: "scale(1)" },
                                  "50%": { transform: "scale(1.05)" },
                                  "100%": { transform: "scale(1)" },
                                },
                                "&:hover": {
                                  backgroundColor: "#45a049",
                                },
                              }}
                            >
                              Enrolled
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={() => handleEnrollClick(event.id)}
                              sx={{
                                backgroundColor: "#ff001e",
                                fontFamily: "Poppins",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#d4001a",
                                },
                              }}
                            >
                              Enroll
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={handleCancel} TransitionComponent={Slide} keepMounted>
        <DialogTitle>{"Confirm Enrollment"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to enroll in this event?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Yes, Enroll
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Events;
