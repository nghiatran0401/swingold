import React, { useEffect, useState } from "react";
import { fetchEvents, fetchItems, createEvent, updateEvent, deleteEvent, createItem, updateItem, deleteItem } from "../api";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Paper, Stack, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Admin({ user }) {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for new event/item
  const [newEvent, setNewEvent] = useState({ name: "", fee: "", earn: "", date: "", description: "", month: "", location: "", seats: 0 });
  const [newItem, setNewItem] = useState({ name: "", price: 0, description: "" });

  // Edit dialog state
  const [editEvent, setEditEvent] = useState(null); // event object or null
  const [editItem, setEditItem] = useState(null); // item object or null
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'event' or 'item'

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
      setNewEvent({ name: "", fee: "", earn: "", date: "", description: "", month: "", location: "", seats: 0 });
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
      setNewItem({ name: "", price: 0, description: "" });
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
      <Typography variant="h4" fontWeight={700} mb={3}>
        Admin Panel
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Events Section */}
          <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" mb={2}>
              Events
            </Typography>
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
                  <ListItemText primary={event.name} secondary={`Date: ${event.date} | Fee: ${event.fee} | Earn: ${event.earn}`} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" mb={1}>
              Add New Event
            </Typography>
            <Stack direction="column" spacing={1}>
              <TextField label="Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} size="small" />
              <TextField label="Fee" value={newEvent.fee} onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })} size="small" />
              <TextField label="Earn" value={newEvent.earn} onChange={(e) => setNewEvent({ ...newEvent, earn: e.target.value })} size="small" />
              <TextField label="Date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} size="small" />
              <TextField label="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} size="small" />
              <TextField label="Month" value={newEvent.month} onChange={(e) => setNewEvent({ ...newEvent, month: e.target.value })} size="small" />
              <TextField label="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} size="small" />
              <TextField label="Seats" type="number" value={newEvent.seats} onChange={(e) => setNewEvent({ ...newEvent, seats: Number(e.target.value) })} size="small" />
              <Button variant="contained" onClick={handleCreateEvent}>
                Add Event
              </Button>
            </Stack>
          </Paper>

          {/* Items Section */}
          <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" mb={2}>
              Items
            </Typography>
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
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" mb={1}>
              Add New Item
            </Typography>
            <Stack direction="column" spacing={1}>
              <TextField label="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} size="small" />
              <TextField label="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} size="small" />
              <TextField label="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} size="small" />
              <Button variant="contained" onClick={handleCreateItem}>
                Add Item
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Edit Dialog (shared for event/item) */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {editType === "event" ? "Event" : "Item"}</DialogTitle>
        <DialogContent>
          {editType === "event" && editEvent && (
            <Stack spacing={2} mt={1}>
              <TextField label="Name" value={editEvent.name} onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })} fullWidth />
              <TextField label="Fee" value={editEvent.fee} onChange={(e) => setEditEvent({ ...editEvent, fee: e.target.value })} fullWidth />
              <TextField label="Earn" value={editEvent.earn} onChange={(e) => setEditEvent({ ...editEvent, earn: e.target.value })} fullWidth />
              <TextField label="Date" value={editEvent.date} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} fullWidth />
              <TextField label="Description" value={editEvent.description} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} fullWidth />
              <TextField label="Month" value={editEvent.month} onChange={(e) => setEditEvent({ ...editEvent, month: e.target.value })} fullWidth />
              <TextField label="Location" value={editEvent.location} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} fullWidth />
              <TextField label="Seats" type="number" value={editEvent.seats} onChange={(e) => setEditEvent({ ...editEvent, seats: Number(e.target.value) })} fullWidth />
            </Stack>
          )}
          {editType === "item" && editItem && (
            <Stack spacing={2} mt={1}>
              <TextField label="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} fullWidth />
              <TextField label="Price" type="number" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })} fullWidth />
              <TextField label="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} fullWidth />
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
