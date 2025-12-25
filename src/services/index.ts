/**
 * Service Layer Index
 * Central export point for all services
 * Makes it easy to import services throughout the application
 */

export { listingService } from './listingService';
export { bookingService } from './bookingService';
export { availabilityService } from './availabilityService';
export { authService } from './authService';

// Re-export types for convenience
export type { User } from './authService';
export type { AvailabilityData } from './availabilityService';
