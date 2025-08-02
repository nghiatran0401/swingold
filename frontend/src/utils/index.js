import { DATE_FORMATS } from '../constants';

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {string} format - Format to use (default: DISPLAY)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = DATE_FORMATS.DISPLAY) => {
  if (!dateString) return 'TBD';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(format === DATE_FORMATS.DATETIME && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });
};

/**
 * Format a price value with GOLD currency
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = price => {
  if (price === 0 || price === null || price === undefined) {
    return '🎉 Free';
  }
  return `${price.toFixed(2)} GOLD`;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Convert month number to month name
 * @param {string} yearMonth - YYYY-MM format
 * @returns {string} Month name
 */
export const convertToMonthName = yearMonth => {
  if (yearMonth === 'All') return 'All';
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const [_year, month] = yearMonth.split('-');
  const monthIndex = parseInt(month) - 1;
  return monthNames[monthIndex] || yearMonth;
};

/**
 * Get month value for comparison
 * @param {string} monthName - Month name
 * @returns {string} Month value in MM format
 */
export const getMonthValue = monthName => {
  if (monthName === 'All') return 'All';
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthIndex = monthNames.indexOf(monthName);
  return monthIndex !== -1 ? String(monthIndex + 1).padStart(2, '0') : null;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate wallet address format
 * @param {string} address - Wallet address to validate
 * @returns {boolean} Is valid wallet address
 */
export const isValidWalletAddress = address => {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
};

/**
 * Truncate wallet address for display
 * @param {string} address - Full wallet address
 * @returns {string} Truncated address (0x1234...5678)
 */
export const truncateAddress = address => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = obj => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} Is admin
 */
export const isAdmin = user => {
  return user && user.is_admin === true;
};

/**
 * Get user from localStorage
 * @returns {Object|null} User object or null
 */
export const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Save user to localStorage
 * @param {Object} user - User object to save
 */
export const saveUserToStorage = user => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

/**
 * Remove user from localStorage
 */
export const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};
