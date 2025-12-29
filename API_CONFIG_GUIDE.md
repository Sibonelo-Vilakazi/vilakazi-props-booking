# API Configuration Guide

This document explains how to manage API endpoints in the Vilakazi Props Booking application.

## Overview

All API endpoints are centralized in `/src/config/api.ts` for easy maintenance and deployment configuration.

## Configuration Files

### 1. `/src/config/api.ts`
Central configuration file containing:
- **API_CONFIG**: Base URL and timeout settings
- **API_ENDPOINTS**: All API endpoint paths
- **Helper functions**: `buildApiUrl()`, `getFetchOptions()`, `getAuthToken()`

### 2. `.env` (Create this file)
Environment-specific configuration:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 3. `.env.example`
Template for environment variables (committed to git)

## How to Use

### In Your Components

```typescript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Example: Fetch data
const response = await fetch(buildApiUrl(API_ENDPOINTS.BOOKINGS.GET_ALL));

// Example: With dynamic parameter
const response = await fetch(
  buildApiUrl(API_ENDPOINTS.BOOKINGS.GET_BY_ID('booking-123'))
);
```

### With Authentication

```typescript
import { buildApiUrl, API_ENDPOINTS, getFetchOptions } from '../config/api';

const response = await fetch(
  buildApiUrl(API_ENDPOINTS.BOOKINGS.CREATE),
  getFetchOptions({
    method: 'POST',
    body: JSON.stringify(bookingData)
  })
);
```

## Available Endpoints

### Availability
- `AVAILABILITY.CHECK` - Check availability
- `AVAILABILITY.GET_BLOCKED(listingId)` - Get blocked dates
- `AVAILABILITY.UPDATE(listingId)` - Update availability
- `AVAILABILITY.CHECK_DATES(listingId)` - Check specific dates

### Bookings
- `BOOKINGS.GET_ALL` - Get all bookings
- `BOOKINGS.GET_BY_USER(userId)` - Get user's bookings
- `BOOKINGS.GET_BY_ID(bookingId)` - Get specific booking
- `BOOKINGS.CREATE` - Create new booking
- `BOOKINGS.UPDATE(bookingId)` - Update booking
- `BOOKINGS.DELETE(bookingId)` - Delete booking

### Listings
- `LISTINGS.GET_ALL` - Get all listings
- `LISTINGS.GET_BY_ID(listingId)` - Get specific listing
- `LISTINGS.CREATE` - Create new listing
- `LISTINGS.UPDATE(listingId)` - Update listing
- `LISTINGS.DELETE(listingId)` - Delete listing

### Authentication
- `AUTH.LOGIN` - User login
- `AUTH.REGISTER` - User registration
- `AUTH.LOGOUT` - User logout
- `AUTH.REFRESH` - Refresh token
- `AUTH.PROFILE(userId)` - Get user profile

### Transactions
- `TRANSACTIONS.INITIATE` - Initiate payment
- `TRANSACTIONS.VERIFY` - Verify payment
- `TRANSACTIONS.CALLBACK` - Payment callback

### Messages
- `MESSAGES.GET_ALL` - Get all messages
- `MESSAGES.GET_BY_ID(messageId)` - Get specific message
- `MESSAGES.CREATE` - Create new message
- `MESSAGES.UPDATE(messageId)` - Update message
- `MESSAGES.DELETE(messageId)` - Delete message

## Deployment

### Development
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000
```

### Production
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Building for Production
```bash
# The build process will use the production env variables
npm run build
```

## Migration from Hardcoded URLs

### Before
```typescript
const response = await fetch('http://localhost:3000/api/bookings');
```

### After
```typescript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const response = await fetch(buildApiUrl(API_ENDPOINTS.BOOKINGS.GET_ALL));
```

## Benefits

1. **Single Source of Truth**: All endpoints in one place
2. **Environment-Specific**: Easy to switch between dev/staging/production
3. **Type Safety**: TypeScript autocomplete for all endpoints
4. **Easy Maintenance**: Update endpoints in one file
5. **DRY Principle**: No repeated URL strings throughout the codebase
6. **Authentication**: Centralized auth token management

## Best Practices

1. Always use `buildApiUrl()` to construct full URLs
2. Use `getFetchOptions()` for requests that need authentication
3. Never hardcode URLs in components or services
4. Add new endpoints to `API_ENDPOINTS` object
5. Update `.env.example` when adding new environment variables

## Current Implementation Status

✅ **Updated Files:**
- `/src/config/api.ts` - Created
- `/src/pages/Booking.tsx` - Updated
- `/src/services/listingService.ts` - Examples updated
- `/src/services/bookingService.ts` - Examples updated
- `/src/services/availabilityService.ts` - Examples updated
- `/src/services/authService.ts` - Examples updated

📝 **Next Steps:**
1. Create `.env` file with your API base URL
2. Test API calls in development
3. Update production environment variables before deployment
