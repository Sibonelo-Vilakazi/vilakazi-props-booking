import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing } from '../types';

/**
 * Listing Service
 * Handles all listing-related data operations
 * To migrate to Node.js backend: Replace Firebase calls with API fetch calls
 */

export const listingService = {
  /**
   * Get a single listing by ID
   * @param listingId - The ID of the listing to fetch
   * @returns Promise<Listing | null>
   */
  async getListingById(listingId: string): Promise<Listing | null> {
    try {
      const docRef = doc(db, 'listings', listingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Listing;
      }
      return null;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  },

  /**
   * Get all listings
   * @returns Promise<Listing[]>
   */
  async getAllListings(): Promise<Listing[]> {
    try {
      const listingsQuery = query(collection(db, 'listings'));
      const querySnapshot = await getDocs(listingsQuery);
      
      const listings: Listing[] = [];
      querySnapshot.forEach((doc) => {
        listings.push({ id: doc.id, ...doc.data() } as Listing);
      });
      
      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }
};

// Example of how to migrate to Node.js backend:
/*
export const listingService = {
  async getListingById(listingId: string): Promise<Listing | null> {
    const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getAllListings(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/api/listings`);
    if (!response.ok) throw new Error('Failed to fetch listings');
    return await response.json();
  }
};
*/
