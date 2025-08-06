// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

// Navigation
export const NAVIGATION_ITEMS = [
  { path: "/events", label: "Events" },
  { path: "/items", label: "Items" },
  { path: "/wallet", label: "Wallet" },
  { path: "/admin", label: "Admin" },
];

// UI Constants
export const COLORS = {
  primary: "#ff001e",
  primaryDark: "#d4001a",
  primaryLight: "#b30017",
  secondary: "#2A2828",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  background: "#fafafa",
  white: "#ffffff",
  gray: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DATETIME: "MMM dd, yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Z-Index Values
export const Z_INDEX = {
  NAVBAR: 1100,
  DIALOG: 1300,
  TOOLTIP: 1500,
  MODAL: 1400,
};
