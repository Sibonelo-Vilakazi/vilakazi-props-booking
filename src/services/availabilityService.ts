import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Availability Service
 * Handles checking and managing listing availability (blocked dates)
 * To migrate to Node.js backend: Replace Firebase calls with API fetch calls
 */

export interface AvailabilityData {
  listingId: string;
  blockedDates: string[];
  updatedAt: string;
}

export const availabilityService = {
  /**
   * Get blocked dates for a listing
   * @param listingId - The ID of the listing
   * @returns Promise<string[]> - Array of blocked date strings (YYYY-MM-DD)
   */
  async getBlockedDates(listingId: string): Promise<string[]> {
    try {
      const availabilityRef = doc(db, 'availability', listingId);
      const availabilitySnap = await getDoc(availabilityRef);
      
      if (availabilitySnap.exists()) {
        const data = availabilitySnap.data() as AvailabilityData;
        return data.blockedDates || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
      throw error;
    }
  },

  /**
   * Update blocked dates for a listing
   * @param listingId - The ID of the listing
   * @param blockedDates - Array of blocked date strings
   * @returns Promise<void>
   */
  async updateBlockedDates(listingId: string, blockedDates: string[]): Promise<void> {
    try {
      const availabilityRef = doc(db, 'availability', listingId);
      await updateDoc(availabilityRef, {
        blockedDates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating blocked dates:', error);
      throw error;
    }
  },

  /**
   * Check if specific dates are available
   * @param listingId - The ID of the listing
   * @param checkIn - Check-in date string (YYYY-MM-DD)
   * @param checkOut - Check-out date string (YYYY-MM-DD)
   * @returns Promise<boolean> - True if available, false if blocked
   */
  async checkAvailability(listingId: string, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const blockedDates = await this.getBlockedDates(listingId);
      
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Check if any blocked date falls within the range (excluding checkout date)
      const hasBlockedDates = blockedDates.some(dateStr => {
        const blocked = new Date(dateStr);
        return blocked > start && blocked < end;
      });
      
      return !hasBlockedDates;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }
};

// Example of how to migrate to Node.js backend:
/*
export const availabilityService = {
  async getBlockedDates(listingId: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/availability/${listingId}`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    const data = await response.json();
    return data.blockedDates;
  },

  async updateBlockedDates(listingId: string, blockedDates: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/availability/${listingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ blockedDates })
    });
    if (!response.ok) throw new Error('Failed to update availability');
  },

  async checkAvailability(listingId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/api/availability/${listingId}/check?checkIn=${checkIn}&checkOut=${checkOut}`
    );
    if (!response.ok) throw new Error('Failed to check availability');
    const data = await response.json();
    return data.available;
  }
};
*/
