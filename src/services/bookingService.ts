import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking } from '../types';

/**
 * Booking Service
 * Handles all booking-related data operations
 * To migrate to Node.js backend: Replace Firebase calls with API fetch calls
 */

export const bookingService = {
  /**
   * Get all bookings for a specific user
   * @param userId - The ID of the user
   * @returns Promise<Booking[]>
   */
  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('guestId', '==', userId)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      
      const bookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  /**
   * Get all bookings for a specific listing
   * @param listingId - The ID of the listing
   * @returns Promise<Booking[]>
   */
  async getBookingsByListingId(listingId: string): Promise<Booking[]> {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('listingId', '==', listingId)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      
      const bookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      return bookings;
    } catch (error) {
      console.error('Error fetching listing bookings:', error);
      throw error;
    }
  },

  /**
   * Create a new booking
   * @param bookingData - The booking data to create
   * @returns Promise<string> - The ID of the created booking
   */
  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: bookingData.createdAt || new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Get a single booking by ID
   * @param bookingId - The ID of the booking
   * @returns Promise<Booking | null>
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Booking;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  /**
   * Update a booking
   * @param bookingId - The ID of the booking to update
   * @param updates - The fields to update
   * @returns Promise<void>
   */
  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  /**
   * Get all bookings (Admin only)
   * @returns Promise<Booking[]>
   */
  async getAllBookings(): Promise<Booking[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      
      const bookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      // Sort by creation date, newest first
      return bookings.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  }
};

// Example of how to migrate to Node.js backend:
/*
export const bookingService = {
  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  },

  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) throw new Error('Failed to create booking');
    const result = await response.json();
    return result.id;
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update booking');
  }
};
*/
