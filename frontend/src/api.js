const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// Fetch all events, get events by month
export const fetchEvents = async (month = null, search = null) => {
  let url = `${API_BASE_URL}/events`;
  const params = new URLSearchParams();
  if (month && month !== "All") params.append("month", month);
  if (search) params.append("search", search);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

// Fetch all Items
export const fetchItems = async (search = null) => {
  let url = `${API_BASE_URL}/items`;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
};

// Fetch all transactions of one user
export const fetchTransactions = async (userId = 1) => {
  let url = `${API_BASE_URL}/transactions?user_id=${userId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

// Get user balance
export const fetchUserBalance = async (userId = 1) => {
  let url = `${API_BASE_URL}/transactions/user/${userId}/balance`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch user balance");
  const data = await res.json();
  return data.gold_balance;
};

// Toggle favorite item
export const toggleItemFavorite = async (itemId) => {
  let url = `${API_BASE_URL}/items/${itemId}/favorite`;
  const res = await fetch(url, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
};

// Toggle Event enrollment
export const toggleEventEnrollment = async (eventId) => {
  let url = `${API_BASE_URL}/events/${eventId}/enroll`;
  const res = await fetch(url, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle enrollment");
  return res.json();
};

// Get all available months in Events table
export const fetchAvailableMonths = async () => {
  let url = `${API_BASE_URL}/events/months/list`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch months");
  return res.json();
};

// Send post request to Login API
export const loginUser = async (username, password) => {
  const url = `${API_BASE_URL}/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  return res.json();
};

// Post request to Event API to create new event
export const createEvent = async (event, userId) => {
  const url = `${API_BASE_URL}/events`;
  const res = await fetch(url, {
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

//Put request to Update Event
export const updateEvent = async (eventId, event, userId) => {
  const url = `${API_BASE_URL}/events/${eventId}`;
  const res = await fetch(url, {
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

// Request Delete an Event
export const deleteEvent = async (eventId, userId) => {
  const url = `${API_BASE_URL}/events/${eventId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};

// Post request to create new item
export const createItem = async (item, userId) => {
  const url = `${API_BASE_URL}/items`;
  const res = await fetch(url, {
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

// Put request to update item
export const updateItem = async (itemId, item, userId) => {
  const url = `${API_BASE_URL}/items/${itemId}`;
  const res = await fetch(url, {
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

// Request to delete item
export const deleteItem = async (itemId, userId) => {
  const url = `${API_BASE_URL}/items/${itemId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to delete item");
  return res.json();
};
