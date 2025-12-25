# 🏗️ Service Layer Architecture - Backend Migration Guide

## 📋 Overview

Your application now uses a **service layer architecture** that abstracts all data operations. This makes it easy to switch from Firebase to a Node.js backend without touching your React components!

## 🎯 What Changed

### Before (Direct Firebase Calls):
```tsx
// In components - tightly coupled to Firebase
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const docRef = doc(db, 'listings', '1');
const docSnap = await getDoc(docRef);
const listing = docSnap.data();
```

### After (Service Layer):
```tsx
// In components - decoupled, backend-agnostic
import { listingService } from '../services';

const listing = await listingService.getListingById('1');
```

## 📂 Service Structure

```
src/services/
├── index.ts                  # Central export point
├── listingService.ts         # Property/listing operations
├── bookingService.ts         # Booking/reservation operations
├── availabilityService.ts    # Availability/blocked dates
└── authService.ts            # Authentication operations
```

## 🔧 Available Services

### 1. **listingService**
```typescript
// Get a single listing
await listingService.getListingById('1');

// Get all listings
await listingService.getAllListings();
```

### 2. **bookingService**
```typescript
// Get user's bookings
await bookingService.getBookingsByUserId(userId);

// Get listing's bookings
await bookingService.getBookingsByListingId(listingId);

// Create a booking
await bookingService.createBooking(bookingData);

// Get single booking
await bookingService.getBookingById(bookingId);

// Update a booking
await bookingService.updateBooking(bookingId, updates);
```

### 3. **availabilityService**
```typescript
// Get blocked dates
await availabilityService.getBlockedDates(listingId);

// Update blocked dates
await availabilityService.updateBlockedDates(listingId, dates);

// Check if dates are available
await availabilityService.checkAvailability(listingId, checkIn, checkOut);
```

### 4. **authService**
```typescript
// Sign in
await authService.signIn(email, password);

// Register
await authService.register(email, password, name, phone);

// Google sign-in
await authService.signInWithGoogle();

// Sign out
await authService.signOut();

// Get user profile
await authService.getCurrentUserProfile(userId);
```

## 🔄 Migration to Node.js Backend

### Step 1: Create Your Node.js API

Example Express.js structure:
```
backend/
├── server.js
├── routes/
│   ├── listings.js
│   ├── bookings.js
│   ├── availability.js
│   └── auth.js
├── models/
│   ├── Listing.js
│   ├── Booking.js
│   └── User.js
└── middleware/
    └── auth.js
```

### Step 2: Update Service Files

Each service file has commented-out code showing the Node.js implementation!

**Example: listingService.ts**

Current (Firebase):
```typescript
async getListingById(listingId: string): Promise<Listing | null> {
  const docRef = doc(db, 'listings', listingId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Listing;
  }
  return null;
}
```

Replace with (Node.js API):
```typescript
async getListingById(listingId: string): Promise<Listing | null> {
  const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`);
  if (!response.ok) return null;
  return await response.json();
}
```

### Step 3: Create API Configuration

```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // ... put, patch, delete methods
};
```

### Step 4: Replace Service Implementations

**listingService.ts** (Node.js version):
```typescript
import { apiClient } from '../config/api';
import { Listing } from '../types';

export const listingService = {
  async getListingById(listingId: string): Promise<Listing | null> {
    try {
      return await apiClient.get(`/api/listings/${listingId}`);
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  },

  async getAllListings(): Promise<Listing[]> {
    try {
      return await apiClient.get('/api/listings');
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }
};
```

**bookingService.ts** (Node.js version):
```typescript
import { apiClient } from '../config/api';
import { Booking } from '../types';

export const bookingService = {
  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return await apiClient.get(`/api/bookings/user/${userId}`);
  },

  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<string> {
    const result = await apiClient.post('/api/bookings', bookingData);
    return result.id;
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    await apiClient.patch(`/api/bookings/${bookingId}`, updates);
  }
};
```

**authService.ts** (Node.js version with JWT):
```typescript
import { apiClient, API_BASE_URL } from '../config/api';
import { User } from '../types';

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const data = await apiClient.post('/api/auth/login', { email, password });
    localStorage.setItem('authToken', data.token);
    return data.user;
  },

  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    const data = await apiClient.post('/api/auth/register', { email, password, name, phone });
    localStorage.setItem('authToken', data.token);
    return data.user;
  },

  async signInWithGoogle(): Promise<User> {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('authToken');
  },

  async getCurrentUserProfile(userId: string): Promise<User | null> {
    try {
      return await apiClient.get(`/api/users/${userId}`);
    } catch {
      return null;
    }
  }
};
```

## 📝 Example Node.js Backend Routes

### Listings Route (Express.js)
```javascript
// routes/listings.js
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Bookings Route
```javascript
// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// GET /api/bookings/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.params.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ id: booking._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

### Auth Route
```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

## ✅ Benefits of Service Layer

### 1. **Separation of Concerns**
- Components focus on UI logic
- Services handle data operations
- Easy to test each layer independently

### 2. **Easy Backend Migration**
- Change only service files
- Zero changes to React components
- Gradual migration possible

### 3. **Consistent Error Handling**
- Centralized error handling
- Consistent API across app
- Easy to add logging/monitoring

### 4. **Reusable Code**
- Services used across multiple components
- DRY principle
- Single source of truth

### 5. **Type Safety**
- TypeScript interfaces enforced
- Catch errors at compile time
- Better IDE autocomplete

## 🚀 Migration Checklist

- [ ] Set up Node.js backend with Express
- [ ] Create MongoDB/PostgreSQL database
- [ ] Implement API routes for all services
- [ ] Add JWT authentication middleware
- [ ] Create `src/config/api.ts` in frontend
- [ ] Replace Firebase service implementations
- [ ] Update environment variables
- [ ] Test all endpoints
- [ ] Implement error handling
- [ ] Add request/response logging
- [ ] Deploy backend
- [ ] Update frontend API_BASE_URL
- [ ] Test production environment

## 📊 Current Components Using Services

✅ **Home.tsx** - Uses `listingService`  
✅ **Booking.tsx** - Uses `listingService`, `bookingService`, `availabilityService`  
✅ **ReservationHistory.tsx** - Uses `listingService`, `bookingService`  
✅ **Gallery.tsx** - Uses `listingService`  
✅ **AuthContext.tsx** - Still uses Firebase directly (can migrate to `authService`)

## 🎯 Next Steps

1. **Keep using Firebase** - Everything works as-is
2. **Build Node.js API** - Create backend when ready
3. **Swap implementations** - Update service files only
4. **No component changes** - Your React code stays the same!

---

**Your app is now architecture-ready for any backend! 🚀**

The service layer makes it easy to switch from Firebase to Node.js, REST API, GraphQL, or any other backend without touching your UI code.
