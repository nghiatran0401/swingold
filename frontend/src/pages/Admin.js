import React, { useEffect, useState } from "react";
import { fetchEvents, fetchItems, createEvent, updateEvent, deleteEvent, createItem, updateItem, deleteItem } from "../api";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Paper, Stack, Alert, Tabs, Tab } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Admin({ user }) {
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
      <Box pt={10}>
        <Alert severity="error">Access denied. Admins only.</Alert>
      </Box>
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
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} mt={6}></Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
            <Tab label="Events" />
            <Tab label="Items" />
          </Tabs>
          {tab === 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" color="primary" onClick={() => setCreateDialogOpen("event")} sx={{ fontFamily: "Poppins", textTransform: "none" }}>
                  Create New Event
                </Button>
              </Box>
              <List>
                {events.map((event) => (
                  <ListItem
                    key={event.id}
                    secondaryAction={
                      <>
                        <IconButton edge="end" onClick={() => openEditDialog("event", event)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" color="error" onClick={() => handleDeleteEvent(event.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={event.name} secondary={`Category: ${event.category || ""} | Price: ${event.price} | Status: ${event.status}`} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {tab === 1 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" color="primary" onClick={() => setCreateDialogOpen("item")} sx={{ fontFamily: "Poppins", textTransform: "none" }}>
                  Create New Item
                </Button>
              </Box>
              <List>
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <>
                        <IconButton edge="end" onClick={() => openEditDialog("item", item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" color="error" onClick={() => handleDeleteItem(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={item.name} secondary={`Price: $${item.price} | ${item.description}`} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      {/* Create Dialog (event/item) */}
      <Dialog open={!!createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{createDialogOpen === "event" ? "Create New Event" : "Create New Item"}</DialogTitle>
        <DialogContent dividers>
          {createDialogOpen === "event" ? (
            <Stack direction="column" spacing={1} mt={1}>
              <TextField label="Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} size="small" required />
              <TextField label="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} size="small" multiline minRows={2} />
              <TextField label="Category" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} size="small" />
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={newEvent.start_datetime}
                onChange={(e) => setNewEvent({ ...newEvent, start_datetime: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                value={newEvent.end_datetime}
                onChange={(e) => setNewEvent({ ...newEvent, end_datetime: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Price (Gold)"
                type="number"
                value={newEvent.price === undefined ? "" : newEvent.price}
                onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                size="small"
              />
              <TextField label="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} size="small" />
              <TextField
                label="Seats Available"
                type="number"
                value={newEvent.seats_available === undefined ? "" : newEvent.seats_available}
                onChange={(e) => setNewEvent({ ...newEvent, seats_available: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                size="small"
              />
              <TextField label="Image URL" value={newEvent.image_url} onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })} size="small" />
              <TextField label="Tags" value={newEvent.tags} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} size="small" />
              <TextField label="Status" select value={newEvent.status || "upcoming"} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })} size="small" SelectProps={{ native: true }}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
            </Stack>
          ) : (
            createDialogOpen === "item" && (
              <Stack direction="column" spacing={1} mt={1}>
                <TextField label="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} size="small" required />
                <TextField label="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} size="small" multiline minRows={2} />
                <TextField label="Image URL" value={newItem.image_url} onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })} size="small" />
                <TextField
                  label="Price (Gold)"
                  type="number"
                  value={newItem.price === undefined ? "" : newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value === "" ? 0.0 : parseFloat(e.target.value) })}
                  size="small"
                />
                <TextField label="Tags (comma-separated)" value={newItem.tags} onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })} size="small" placeholder="tag1, tag2, tag3" />
                <TextField label="Note" value={newItem.note} onChange={(e) => setNewItem({ ...newItem, note: e.target.value })} size="small" multiline minRows={2} placeholder="Internal notes or additional information" />
              </Stack>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
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
            color="primary"
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog (shared for event/item) */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {editType === "event" ? "Event" : "Item"}</DialogTitle>
        <DialogContent>
          {editType === "event" && editEvent && (
            <Stack spacing={2} mt={1}>
              <TextField label="Name" value={editEvent.name || ""} onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })} fullWidth required />
              <TextField label="Description" value={editEvent.description || ""} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} fullWidth multiline minRows={2} />
              <TextField label="Category" value={editEvent.category || ""} onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })} fullWidth />
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={editEvent.start_datetime || ""}
                onChange={(e) => setEditEvent({ ...editEvent, start_datetime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                value={editEvent.end_datetime || ""}
                onChange={(e) => setEditEvent({ ...editEvent, end_datetime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Price (Gold)"
                type="number"
                value={editEvent.price === undefined ? "" : editEvent.price}
                onChange={(e) => setEditEvent({ ...editEvent, price: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                fullWidth
              />
              <TextField label="Location" value={editEvent.location || ""} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} fullWidth />
              <TextField
                label="Seats Available"
                type="number"
                value={editEvent.seats_available === undefined ? "" : editEvent.seats_available}
                onChange={(e) => setEditEvent({ ...editEvent, seats_available: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                fullWidth
              />
              <TextField label="Image URL" value={editEvent.image_url || ""} onChange={(e) => setEditEvent({ ...editEvent, image_url: e.target.value })} fullWidth />
              <TextField label="Tags" value={editEvent.tags || ""} onChange={(e) => setEditEvent({ ...editEvent, tags: e.target.value })} fullWidth />
              <TextField label="Status" select value={editEvent.status || "upcoming"} onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })} fullWidth SelectProps={{ native: true }}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
            </Stack>
          )}
          {editType === "item" && editItem && (
            <Stack direction="column" spacing={1} mt={1}>
              <TextField label="Name" value={editItem.name || ""} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} size="small" required />
              <TextField label="Description" value={editItem.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} size="small" multiline minRows={2} />
              <TextField label="Image URL" value={editItem.image_url || ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} size="small" />
              <TextField
                label="Price (Gold)"
                type="number"
                value={editItem.price === undefined ? "" : editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value === "" ? 0.0 : parseFloat(e.target.value) })}
                size="small"
              />
              <TextField label="Tags (comma-separated)" value={editItem.tags || ""} onChange={(e) => setEditItem({ ...editItem, tags: e.target.value })} size="small" placeholder="tag1, tag2, tag3" />
              <TextField
                label="Note"
                value={editItem.note || ""}
                onChange={(e) => setEditItem({ ...editItem, note: e.target.value })}
                size="small"
                multiline
                minRows={2}
                placeholder="Internal notes or additional information"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
