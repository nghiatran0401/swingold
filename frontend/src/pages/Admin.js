import React, { useEffect, useState } from "react";
import { fetchEvents, fetchItems, createEvent, updateEvent, deleteEvent, createItem, updateItem, deleteItem } from "../api";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Paper, Stack, Alert, Tabs, Tab, Chip, Slide } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";

export default function Admin({ user, logout }) {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for new event/item
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    category: "",
    start_datetime: "",
    end_datetime: "",
    price: 0,
    location: "",
    seats_available: 0,
    image_url: "",
    tags: "",
    status: "upcoming",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    image_url: "",
    price: 0.0,
    tags: "",
    note: "",
  });

  // Edit dialog state
  const [editEvent, setEditEvent] = useState(null); // event object or null
  const [editItem, setEditItem] = useState(null); // item object or null
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'event' or 'item'
  const [tab, setTab] = useState(0); // 0: Events, 1: Items
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) return;
    setLoading(true);
    Promise.all([fetchEvents(), fetchItems()])
      .then(([events, items]) => {
        setEvents(events);
        setItems(items);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user]);

  if (!user || !user.is_admin) {
    return (
      <>
        <Navbar logout={logout} />
        <Box
          sx={{
            backgroundColor: "#fafafa",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: 10,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              backgroundColor: "#ffffff",
              border: "1px solid #f0f0f0",
              p: 6,
              textAlign: "center",
              maxWidth: "500px",
              mx: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Poppins",
                fontWeight: "700",
                color: "#ff001e",
                mb: 3,
              }}
            >
              🚫 Access Denied
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Poppins",
                color: "#666",
                mb: 4,
              }}
            >
              This page is restricted to administrators only.
            </Typography>
            <Alert severity="error" sx={{ fontFamily: "Poppins" }}>
              Admins only.
            </Alert>
          </Paper>
      </Box>
      </>
    );
  }

  // --- CRUD HANDLERS ---
  const handleCreateEvent = async () => {
    try {
      const event = await createEvent(newEvent, user.id);
      setEvents([...events, event]);
      setNewEvent({
        name: "",
        description: "",
        category: "",
        start_datetime: "",
        end_datetime: "",
        price: 0,
        location: "",
        seats_available: 0,
        image_url: "",
        tags: "",
        status: "upcoming",
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id, user.id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCreateItem = async () => {
    try {
      const item = await createItem(newItem, user.id);
      setItems([...items, item]);
      setNewItem({
        name: "",
        description: "",
        image_url: "",
        price: 0.0,
        tags: "",
        note: "",
      });
      setCreateDialogOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id, user.id);
      setItems(items.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  // --- EDIT HANDLERS ---
  const openEditDialog = (type, obj) => {
    setEditType(type);
    if (type === "event") setEditEvent({ ...obj });
    else setEditItem({ ...obj });
    setEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditEvent(null);
    setEditItem(null);
    setEditType(null);
  };
  const handleEditSave = async () => {
    try {
      if (editType === "event") {
        const updated = await updateEvent(editEvent.id, editEvent, user.id);
        setEvents(events.map((e) => (e.id === updated.id ? updated : e)));
      } else if (editType === "item") {
        const updated = await updateItem(editItem.id, editItem, user.id);
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      }
      closeEditDialog();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Navbar logout={logout} />

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
              ⚙️ Admin Panel
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
              Manage events, items, and system settings
            </Typography>
          </Box>
        </Box>

        {/* Floating Navigation Section */}
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
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                centered
                sx={{
                  "& .MuiTab-root": {
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    fontSize: "1rem",
                    textTransform: "none",
                    color: "#666",
                    "&.Mui-selected": {
                      color: "#ff001e",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#ff001e",
                    height: "3px",
                    borderRadius: "2px",
                  },
                }}
              >
                <Tab label="Events" />
                <Tab label="Items" />
              </Tabs>
            </Paper>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            px: 4,
            pb: 8,
          }}
        >
      {error && (
            <Alert
              severity="error"
              sx={{
                mb: 4,
                fontFamily: "Poppins",
                borderRadius: "12px",
              }}
            >
          {error}
        </Alert>
      )}

      {loading ? (
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
                Loading...
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "1px solid #f0f0f0",
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
              }}
            >
          {tab === 0 && (
            <>
                  <Box sx={{ p: 4, borderBottom: "1px solid #f0f0f0" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: "700",
                          color: "#2A2828",
                        }}
                      >
                        Events Management
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen("event")}
                        sx={{
                          background: "linear-gradient(45deg, #ff001e, #d4001a)",
                          fontFamily: "Poppins",
                          textTransform: "none",
                          borderRadius: "12px",
                          px: 3,
                          py: 1.2,
                          fontWeight: "600",
                          boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #d4001a, #b30017)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(255, 0, 30, 0.4)",
                          },
                        }}
                      >
                  Create New Event
                </Button>
              </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip label={`${events.length} Total Events`} color="primary" variant="outlined" />
                      <Chip label={`${events.filter((e) => e.status === "upcoming").length} Upcoming`} color="success" variant="outlined" />
                      <Chip label={`${events.filter((e) => e.status === "active").length} Active`} color="warning" variant="outlined" />
                    </Box>
                  </Box>
                  <Box sx={{ maxHeight: "600px", overflow: "auto" }}>
                {events.map((event) => (
                      <Box
                    key={event.id}
                        sx={{
                          p: 3,
                          borderBottom: "1px solid #f0f0f0",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#f8f9ff",
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: "600",
                                color: "#2A2828",
                                mb: 1,
                              }}
                            >
                              {event.name}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                              {event.category && (
                                <Chip
                                  label={event.category}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    fontFamily: "Poppins",
                                    fontWeight: "500",
                                  }}
                                />
                              )}
                              <Chip
                                label={`${event.price} GOLD`}
                                size="small"
                                sx={{
                                  backgroundColor: "#fff3e0",
                                  color: "#f57c00",
                                  fontFamily: "Poppins",
                                  fontWeight: "600",
                                }}
                              />
                              <Chip
                                label={event.status}
                                size="small"
                                sx={{
                                  backgroundColor: event.status === "upcoming" ? "#e8f5e8" : event.status === "active" ? "#fff3e0" : "#ffebee",
                                  color: event.status === "upcoming" ? "#2e7d32" : event.status === "active" ? "#f57c00" : "#d32f2f",
                                  fontFamily: "Poppins",
                                  fontWeight: "500",
                                }}
                              />
                            </Box>
                            {event.description && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#666",
                                  mb: 1,
                                }}
                              >
                                {event.description}
                              </Typography>
                            )}
                            {event.location && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#888",
                                  fontSize: "0.85rem",
                                }}
                              >
                                📍 {event.location}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              onClick={() => openEditDialog("event", event)}
                              sx={{
                                color: "#ff001e",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 0, 30, 0.1)",
                                },
                              }}
                            >
                          <EditIcon />
                        </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteEvent(event.id)}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                                },
                              }}
                            >
                          <DeleteIcon />
                        </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
            </>
          )}
          {tab === 1 && (
            <>
                  <Box sx={{ p: 4, borderBottom: "1px solid #f0f0f0" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: "700",
                          color: "#2A2828",
                        }}
                      >
                        Items Management
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen("item")}
                        sx={{
                          background: "linear-gradient(45deg, #ff001e, #d4001a)",
                          fontFamily: "Poppins",
                          textTransform: "none",
                          borderRadius: "12px",
                          px: 3,
                          py: 1.2,
                          fontWeight: "600",
                          boxShadow: "0 4px 12px rgba(255, 0, 30, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #d4001a, #b30017)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(255, 0, 30, 0.4)",
                          },
                        }}
                      >
                  Create New Item
                </Button>
              </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip label={`${items.length} Total Items`} color="primary" variant="outlined" />
                      <Chip label={`${items.filter((i) => i.price > 0).length} Paid Items`} color="success" variant="outlined" />
                      <Chip label={`${items.filter((i) => i.price === 0).length} Free Items`} color="info" variant="outlined" />
                    </Box>
                  </Box>
                  <Box sx={{ maxHeight: "600px", overflow: "auto" }}>
                {items.map((item) => (
                      <Box
                    key={item.id}
                        sx={{
                          p: 3,
                          borderBottom: "1px solid #f0f0f0",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#f8f9ff",
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: "600",
                                color: "#2A2828",
                                mb: 1,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                              <Chip
                                label={`${item.price} GOLD`}
                                size="small"
                                sx={{
                                  backgroundColor: item.price === 0 ? "#e8f5e8" : "#fff3e0",
                                  color: item.price === 0 ? "#2e7d32" : "#f57c00",
                                  fontFamily: "Poppins",
                                  fontWeight: "600",
                                }}
                              />
                              {item.tags && (
                                <Chip
                                  label="Has Tags"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    fontFamily: "Poppins",
                                    fontWeight: "500",
                                  }}
                                />
                              )}
                            </Box>
                            {item.description && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#666",
                                  mb: 1,
                                }}
                              >
                                {item.description}
                              </Typography>
                            )}
                            {item.note && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "Poppins",
                                  color: "#888",
                                  fontSize: "0.85rem",
                                  fontStyle: "italic",
                                }}
                              >
                                📝 {item.note}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              onClick={() => openEditDialog("item", item)}
                              sx={{
                                color: "#ff001e",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 0, 30, 0.1)",
                                },
                              }}
                            >
                          <EditIcon />
                        </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteItem(item.id)}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                                },
                              }}
                            >
                          <DeleteIcon />
                        </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
            </>
          )}
        </Paper>
      )}
        </Box>
      </Box>

      {/* Create Dialog (event/item) */}
      <Dialog
        open={!!createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        TransitionComponent={Slide}
        keepMounted
        maxWidth="md"
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
              {createDialogOpen === "event" ? "🎉 Create New Event" : "🛍️ Create New Item"}
            </Typography>
          </Box>
        </DialogTitle>
        <Box
          sx={{
            py: { xs: 4, sm: 5, md: 6 },
            px: { xs: 3, sm: 4, md: 5 },
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
          {createDialogOpen === "event" ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              <TextField
                label="Event Name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                required
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Category"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                multiline
                minRows={3}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={newEvent.start_datetime}
                onChange={(e) => setNewEvent({ ...newEvent, start_datetime: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                value={newEvent.end_datetime}
                onChange={(e) => setNewEvent({ ...newEvent, end_datetime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Price (GOLD)"
                type="number"
                value={newEvent.price === undefined ? "" : newEvent.price}
                onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Seats Available"
                type="number"
                value={newEvent.seats_available === undefined ? "" : newEvent.seats_available}
                onChange={(e) => setNewEvent({ ...newEvent, seats_available: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Status"
                select
                value={newEvent.status || "upcoming"}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                fullWidth
                SelectProps={{ native: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
              <TextField
                label="Image URL"
                value={newEvent.image_url}
                onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Tags"
                value={newEvent.tags}
                onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                fullWidth
                placeholder="tag1, tag2, tag3"
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
            </Box>
          ) : (
            createDialogOpen === "item" && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                <TextField
                  label="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                  fullWidth
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
                <TextField
                  label="Price (GOLD)"
                  type="number"
                  value={newItem.price === undefined ? "" : newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value === "" ? 0.0 : parseFloat(e.target.value) })}
                  fullWidth
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
                <TextField
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  multiline
                  minRows={3}
                  fullWidth
                  sx={{
                    fontFamily: "Poppins",
                    gridColumn: { xs: "1", md: "1 / -1" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
                <TextField
                  label="Image URL"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  fullWidth
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
                <TextField
                  label="Tags (comma-separated)"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  fullWidth
                  placeholder="tag1, tag2, tag3"
                  sx={{
                    fontFamily: "Poppins",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
                <TextField
                  label="Note"
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  multiline
                  minRows={3}
                  fullWidth
                  placeholder="Internal notes or additional information"
                  sx={{
                    fontFamily: "Poppins",
                    gridColumn: { xs: "1", md: "1 / -1" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      fontFamily: "Poppins",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.2)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff001e",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff001e",
                      },
                    },
                  }}
                />
              </Box>
            )
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
            onClick={() => setCreateDialogOpen(false)}
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
            onClick={async () => {
              if (createDialogOpen === "event") {
                await handleCreateEvent();
              } else {
                await handleCreateItem();
              }
              setCreateDialogOpen(false);
            }}
            variant="contained"
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
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog (shared for event/item) */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        TransitionComponent={Slide}
        keepMounted
        maxWidth="md"
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
              {editType === "event" ? "✏️ Edit Event" : "✏️ Edit Item"}
            </Typography>
          </Box>
        </DialogTitle>
        <Box
          sx={{
            py: { xs: 4, sm: 5, md: 6 },
            px: { xs: 3, sm: 4, md: 5 },
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
          {editType === "event" && editEvent && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              <TextField
                label="Event Name"
                value={editEvent.name || ""}
                onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                required
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Category"
                value={editEvent.category || ""}
                onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={editEvent.description || ""}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                multiline
                minRows={3}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={editEvent.start_datetime || ""}
                onChange={(e) => setEditEvent({ ...editEvent, start_datetime: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                value={editEvent.end_datetime || ""}
                onChange={(e) => setEditEvent({ ...editEvent, end_datetime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Price (GOLD)"
                type="number"
                value={editEvent.price === undefined ? "" : editEvent.price}
                onChange={(e) => setEditEvent({ ...editEvent, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Location"
                value={editEvent.location || ""}
                onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Seats Available"
                type="number"
                value={editEvent.seats_available === undefined ? "" : editEvent.seats_available}
                onChange={(e) => setEditEvent({ ...editEvent, seats_available: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Status"
                select
                value={editEvent.status || "upcoming"}
                onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })}
                fullWidth
                SelectProps={{ native: true }}
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
              <TextField
                label="Image URL"
                value={editEvent.image_url || ""}
                onChange={(e) => setEditEvent({ ...editEvent, image_url: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Tags"
                value={editEvent.tags || ""}
                onChange={(e) => setEditEvent({ ...editEvent, tags: e.target.value })}
                fullWidth
                placeholder="tag1, tag2, tag3"
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
            </Box>
          )}
          {editType === "item" && editItem && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              <TextField
                label="Item Name"
                value={editItem.name || ""}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                required
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Price (GOLD)"
                type="number"
                value={editItem.price === undefined ? "" : editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value === "" ? 0.0 : parseFloat(e.target.value) })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={editItem.description || ""}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                multiline
                minRows={3}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Image URL"
                value={editItem.image_url || ""}
                onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                fullWidth
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Tags (comma-separated)"
                value={editItem.tags || ""}
                onChange={(e) => setEditItem({ ...editItem, tags: e.target.value })}
                fullWidth
                placeholder="tag1, tag2, tag3"
                sx={{
                  fontFamily: "Poppins",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
              <TextField
                label="Note"
                value={editItem.note || ""}
                onChange={(e) => setEditItem({ ...editItem, note: e.target.value })}
                multiline
                minRows={3}
                fullWidth
                placeholder="Internal notes or additional information"
                sx={{
                  fontFamily: "Poppins",
                  gridColumn: { xs: "1", md: "1 / -1" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    fontFamily: "Poppins",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.2)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ff001e",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ff001e",
                    },
                  },
                }}
              />
            </Box>
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
            onClick={closeEditDialog}
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
            onClick={handleEditSave}
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
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
