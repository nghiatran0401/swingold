import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "../components";
import { fetchEvents, fetchAvailableMonths, toggleEventEnrollment } from "../api";
import { Grid, Paper, Box, Button, Typography, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";
import { convertToMonthName, getMonthValue, formatDate, formatPrice } from "../utils";



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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredSeats, setRegisteredSeats] = useState(0);

  // Fetch available months and events on mount
  useEffect(() => {
    setLoading(true);
    fetchEvents()
      .then((e) => {
        setEvents(e);
      })
      .catch((error) => {
        setError("Failed to fetch events");
      });
    fetchAvailableMonths()
      .then((m) => {
        const monthNames = m.map(convertToMonthName);
        setMonths(["All", ...monthNames]);
      })
      .catch((error) => {
        setError("Failed to fetch available months");
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

    setFilteredEvents(filtered);
  }, [selectedMonth, searchInput, events]);

  const handleEnrollClick = (event) => {
    setPendingEventId(event.id);
    setSelectedEvent(event);
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingEventId(null);
    setSelectedEvent(null);
  };

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
    setSelectedEvent(null);
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
              {selectedMonth === "All" ? "🎉 All Events" : `📅 ${selectedMonth}`}
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
              Discover amazing events happening at Swinburne
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
          <Box
            sx={{
              maxWidth: "1200px",
              mx: "auto",
              px: 4,
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
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 25px 80px rgba(0,0,0,0.15), 0 0 60px rgba(255, 0, 30, 0.15)",
                },
              }}
            >
              {/* Search Bar */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search for events..."
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
              </Box>

              {/* Month Filter Chips */}
              <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
                {months.map((month) => (
                  <Chip
                    key={month}
                    label={month}
                    onClick={() => setSelectedMonth(month)}
                    sx={{
                      backgroundColor: selectedMonth === month ? "#ff001e" : "rgba(255,255,255,0.8)",
                      color: selectedMonth === month ? "#ffffff" : "#2A2828",
                      fontFamily: "Poppins",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      padding: "12px 20px",
                      borderRadius: "20px",
                      border: selectedMonth === month ? "none" : "2px solid rgba(255,255,255,0.3)",
                      transition: "all 0.3s ease",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        backgroundColor: selectedMonth === month ? "#d4001a" : "rgba(255,255,255,0.9)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(255, 0, 30, 0.15)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Events List */}
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            px: 4,
            pb: 8,
          }}
        >
          {filteredEvents.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#666",
                  fontFamily: "Poppins",
                  mb: 2,
                }}
              >
                No events found for {selectedMonth}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#999",
                  fontFamily: "Poppins",
                }}
              >
                Try adjusting your search or selecting a different month
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 3 },
                justifyContent: { xs: "center", md: "flex-start" },
                width: "100%",
              }}
            >
              {filteredEvents.map((event) => (
                <Box
                  key={event.id}
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
                      borderRadius: "24px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
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
                    {/* Event Image */}
                    <Box
                      sx={{
                        position: "relative",
                        height: "200px",
                        overflow: "hidden",
                        borderRadius: "16px 16px 0 0",
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
                        src={event.image_url}
                        alt={event.name}
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
                          label={event.price === 0 ? "🎉 Free" : `${event.price.toFixed(2)} GOLD`}
                          sx={{
                            background: event.price === 0 ? "linear-gradient(45deg, #4caf50, #66bb6a)" : "linear-gradient(45deg, #ff001e, #d4001a)",
                            color: "#ffffff",
                            fontFamily: "Poppins",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                            boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                            minWidth: "100px",
                            height: "32px",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Event Content */}
                    <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: "700",
                          color: "#2A2828",
                          mb: 2,
                          fontSize: "1.3rem",
                          lineHeight: 1.3,
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
                          fontSize: "0.9rem",
                        }}
                      >
                        📅 {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString() : "TBD"}
                      </Typography>

                      {event.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Poppins",
                            color: "#555",
                            mb: 3,
                            lineHeight: 1.5,
                            fontSize: "0.9rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {event.description}
                        </Typography>
                      )}

                      {/* Event Details */}
                      <Box sx={{ mb: 3 }}>
                        {event.location && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "Poppins",
                              color: "#666",
                              fontSize: "0.8rem",
                              mb: 0.5,
                            }}
                          >
                            📍 {event.location}
                          </Typography>
                        )}
                        {event.seats_available && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "Poppins",
                              color: "#666",
                              fontSize: "0.8rem",
                              mb: 0.5,
                            }}
                          >
                            🪑 {event.seats_available} seats available
                          </Typography>
                        )}
                      </Box>

                      {/* Enroll Button */}
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {event.end ? (
                          <Button
                            disabled
                            variant="outlined"
                            sx={{
                              fontFamily: "Poppins",
                              textTransform: "none",
                              borderColor: "#ccc",
                              color: "#999",
                              borderRadius: "12px",
                              px: 3,
                              py: 1,
                            }}
                          >
                            🕐 Ended
                          </Button>
                        ) : enrolledEvents[event.id] ? (
                          <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            sx={{
                              background: "linear-gradient(45deg, #4caf50, #66bb6a)",
                              fontFamily: "Poppins",
                              textTransform: "none",
                              borderRadius: "12px",
                              px: 3,
                              py: 1,
                              fontWeight: "600",
                              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                              animation: "pulse 0.6s ease-out",
                              "@keyframes pulse": {
                                "0%": { transform: "scale(1)" },
                                "50%": { transform: "scale(1.05)" },
                                "100%": { transform: "scale(1)" },
                              },
                              "&:hover": {
                                background: "linear-gradient(45deg, #45a049, #4caf50)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                              },
                            }}
                          >
                            ✅ Enrolled
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => handleEnrollClick(event)}
                            sx={{
                              background: "linear-gradient(45deg, #ff001e, #d4001a)",
                              fontFamily: "Poppins",
                              textTransform: "none",
                              borderRadius: "12px",
                              px: 4,
                              py: 1.2,
                              fontWeight: "600",
                              fontSize: "0.95rem",
                              boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "linear-gradient(45deg, #d4001a, #b30017)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 20px rgba(255, 0, 30, 0.4)",
                              },
                            }}
                          >
                            🎯 Enroll Now
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
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
              🎯 Confirm Enrollment
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
          {/* Event Information Card */}
          {selectedEvent && (
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
              {/* Event Image */}
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
                  src={selectedEvent.image_url}
                  alt={selectedEvent.name}
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
                    label={selectedEvent.price === 0 ? "🎉 Free" : `${selectedEvent.price.toFixed(2)} GOLD`}
                    sx={{
                      background: selectedEvent.price === 0 ? "linear-gradient(45deg, #4caf50, #66bb6a)" : "linear-gradient(45deg, #ff001e, #d4001a)",
                      color: "#ffffff",
                      fontFamily: "Poppins",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      boxShadow: "0 2px 8px rgba(255, 0, 30, 0.3)",
                    }}
                  />
                </Box>
              </Box>

              {/* Event Details */}
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
                {selectedEvent.name}
              </Typography>

              {selectedEvent.description && (
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
                  {selectedEvent.description}
                </Typography>
              )}

              {/* Event Info Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  textAlign: "left",
                }}
              >
                {selectedEvent.start_datetime && (
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
                      📅 Date
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
                      {new Date(selectedEvent.start_datetime).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.location && (
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
                      📍 Location
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
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.seats_available && (
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
                      🪑 Seats
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
                      {selectedEvent.seats_available} available
                    </Typography>
                  </Box>
                )}

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
                    {selectedEvent.price === 0 ? "Free" : `${selectedEvent.price.toFixed(2)} GOLD`}
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
              Are you sure you want to enroll in this event?
            </Typography>
          </Box>
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
            onClick={handleCancel}
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
            onClick={handleConfirm}
            sx={{
              background: "linear-gradient(45deg, #ff001e, #d4001a)",
              color: "#ffffff",
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
            }}
          >
            Yes, Enroll
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Events;
