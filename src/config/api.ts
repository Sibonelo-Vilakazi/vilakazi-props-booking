/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * Change the BASE_URL when deploying to production
 */

// Base URL for the backend API
// For development: http://localhost:3000
// For production: Update this to your deployed backend URL
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
};

/**
 * API Endpoints
 * All API endpoints are defined here for easy maintenance
 */
export const API_ENDPOINTS = {
  // Availability endpoints
  AVAILABILITY: {
    CHECK: '/check-availability',
    GET_BLOCKED: (listingId: string) => `/api/availability/${listingId}`,
    UPDATE: (listingId: string) => `/api/availability/${listingId}`,
    CHECK_DATES: (listingId: string) => `/api/availability/${listingId}/check`,
  },

  // Booking endpoints
  BOOKINGS: {
    GET_BY_USER: (userId: string) => `/api/bookings/user/${userId}`,
    GET_ALL: '/api/bookings',
    GET_BY_ID: (bookingId: string) => `/api/bookings/${bookingId}`,
    CREATE: '/api/bookings',
    UPDATE: (bookingId: string) => `/api/bookings/${bookingId}`,
    DELETE: (bookingId: string) => `/api/bookings/${bookingId}`,
  },

  // Listing endpoints
  LISTINGS: {
    GET_ALL: '/api/listings',
    GET_BY_ID: (listingId: string) => `/api/listings/${listingId}`,
    CREATE: '/api/listings',
    UPDATE: (listingId: string) => `/api/listings/${listingId}`,
    DELETE: (listingId: string) => `/api/listings/${listingId}`,
  },

  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: (userId: string) => `/api/users/${userId}`,
  },

  // Transaction/Payment endpoints
  TRANSACTIONS: {
    INITIATE: '/transactions/initiate',
    VERIFY: '/transactions/verify',
    CALLBACK: '/transactions/callback',
  },

  // Message endpoints
  MESSAGES: {
    GET_ALL: '/api/messages',
    GET_BY_ID: (messageId: string) => `/api/messages/${messageId}`,
    CREATE: '/api/messages',
    UPDATE: (messageId: string) => `/api/messages/${messageId}`,
    DELETE: (messageId: string) => `/api/messages/${messageId}`,
  },
};

/**
 * Helper function to build full URL
 * @param endpoint - The endpoint path
 * @returns Full URL with base URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Helper function to get auth token
 * Update this based on your authentication strategy
 */
export const getAuthToken = (): string | null => {
  // Example: Get token from localStorage
  return localStorage.getItem('authToken');
};

/**
 * Common fetch options with headers
 */
export const getFetchOptions = (options: RequestInit = {}): RequestInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with provided headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...options,
    headers,
  };
};
