import React, { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import Navbar from "../components/Navbar";
import { fetchEvents, fetchAvailableMonths, toggleEventEnrollment } from "../api";
import { Grid, Paper, Box, Button, Typography, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";

function Events({ logout }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [enrolledEvents, setEnrolledEvents] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEventId, setPendingEventId] = useState(null);
  const [registeredSeats, setRegisteredSeats] = useState(0);
  const [events, setEvents] = useState([]);
  const [months, setMonths] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input for events
  useEffect(() => {
    const handler = debounce((val) => setSearchTerm(val), 300);
    handler(searchInput);
    return () => handler.cancel();
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    fetchEvents(selectedMonth)
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  useEffect(() => {
    fetchAvailableMonths().then((m) => setMonths(["All", ...m]));
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .map((event) => ({
        ...event,
        date: event.date || event.start_datetime || "",
        end_date: event.end_date || event.end_datetime || "",
        image: event.image || "",
        name: event.name || "",
        description: event.description || "",
        location: event.location || "",
        category: event.category || "",
        status: event.status || "",
        price: event.price ?? "",
        seats: event.seats ?? "",
      }))
      .filter((event) => (event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())) || (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [events, searchTerm]);

  const handleEnrollClick = (eventId) => {
    setPendingEventId(eventId);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingEventId !== null) {
      try {
        await toggleEventEnrollment(pendingEventId);
        setEnrolledEvents((prev) => ({ ...prev, [pendingEventId]: true }));
        setRegisteredSeats((prev) => prev + 1);
        // Optionally reload events
        fetchEvents(selectedMonth).then((data) => setEvents(data));
      } catch (err) {
        setError(err.message);
      }
    }
    setConfirmOpen(false);
    setPendingEventId(null);
  };

  const handleCancel = () => {
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
                            <img src={event.image} alt={event.name} style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }} />
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
                            Date: {event.date}
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
                          {event.price === 0 ? (
                            <Chip
                              label="Free"
                              clickable={false}
                              onClick={() => {}}
                              sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                fontFamily: "Poppins",
                                fontWeight: "600",
                                mb: 2,
                                minWidth: "80px",
                              }}
                            />
                          ) : (
                            <Chip
                              label={`${event.price} Gold`}
                              clickable={false}
                              onClick={() => {}}
                              sx={{
                                backgroundColor: "#ff001e",
                                color: "#ffffff",
                                fontFamily: "Poppins",
                                fontWeight: "600",
                                mb: 2,
                                minWidth: "80px",
                              }}
                            />
                          )}

                          {event.end_date && (
                            <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#666", fontSize: "12px", mb: 1 }}>
                              Ends: {event.end_date.split("T")[0]}
                            </Typography>
                          )}
                          {event.seats && (
                            <Typography variant="body2" sx={{ fontFamily: "Poppins", color: "#666", fontSize: "12px", mb: 1 }}>
                              Seats: {event.seats}
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
                          ) : enrolledEvents[event.id] || event.enroll ? (
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
