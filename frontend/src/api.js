const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

// Get user from database and save to localStorage
export const loginUser = async (username, password) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  const user = await res.json();
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

// Fetch all events
export const fetchEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

// Create a new event
export const createEvent = async (event, userId) => {
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};

// Update an existing event
export const updateEvent = async (eventId, event, userId) => {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

// Delete an event
export const deleteEvent = async (eventId, userId) => {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};

// Get all available months in Events table
export const fetchAvailableMonths = async () => {
  const res = await fetch(`${API_BASE_URL}/events/months/list`);
  if (!res.ok) throw new Error("Failed to fetch months");
  return res.json();
};

// Fetch all items
export const fetchItems = async () => {
  const res = await fetch(`${API_BASE_URL}/items/`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
};

// Create a new item
export const createItem = async (item, userId) => {
  const res = await fetch(`${API_BASE_URL}/items/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to create item");
  return res.json();
};

// Update an item
export const updateItem = async (itemId, item, userId) => {
  const res = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
};

// Delete an item
export const deleteItem = async (itemId, userId) => {
  const res = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to delete item");
  return res.json();
};

// Toggle Event enrollment
export const toggleEventEnrollment = async (eventId) => {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/enroll`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle enrollment");
  return res.json();
};

// Fetch all transactions of one user
export const fetchTransactions = async (userId = 1) => {
  const res = await fetch(`${API_BASE_URL}/transactions?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

// Record on-chain purchase
export const recordOnchainPurchase = async (purchaseData) => {
  const res = await fetch(`${API_BASE_URL}/transactions/onchain/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchaseData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to record on-chain purchase");
  }
  return res.json();
};

export const sendGold = async (transferData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await fetch(`${API_BASE_URL}/transfers/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": user.id?.toString() || "1",
    },
    body: JSON.stringify(transferData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to send gold");
  }
  return res.json();
};

export const getTransferHistory = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/transfers/history/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch transfer history");
  return res.json();
};
