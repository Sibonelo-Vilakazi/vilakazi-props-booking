import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { mockListing, mockBookings, mockMessages, mockUserReservations } from '../data/mockData';

// Mock users data
const mockUsers = [
  {
    id: 'admin1',
    email: 'admin@bnb.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+27 82 123 4567',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'guest1',
    email: 'guest@example.com',
    name: 'John Smith',
    role: 'guest',
    phone: '+27 83 456 7890',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'guest2',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    role: 'guest',
    phone: '+27 84 567 8901',
    createdAt: '2024-01-20T00:00:00Z'
  }
];

export const initializeFirestore = async () => {
  try {
    console.log('🔥 Starting Firestore initialization...');

    // Initialize Users
    console.log('📝 Adding users...');
    for (const user of mockUsers) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✓ Added user: ${user.name}`);
    }

    // Initialize Listing
    console.log('📝 Adding listing...');
    await setDoc(doc(db, 'listings', mockListing.id), mockListing);
    console.log(`✓ Added listing: ${mockListing.title}`);

    // Initialize Admin Bookings
    console.log('📝 Adding admin bookings...');
    for (const booking of mockBookings) {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      console.log(`✓ Added booking: ${booking.id}`);
    }

    // Initialize User Reservations
    console.log('📝 Adding user reservations...');
    for (const [userId, reservations] of Object.entries(mockUserReservations)) {
      for (const reservation of reservations) {
        await setDoc(doc(db, 'bookings', reservation.id), reservation);
        console.log(`✓ Added reservation: ${reservation.id} for user ${userId}`);
      }
    }

    // Initialize Messages
    console.log('📝 Adding messages...');
    for (const message of mockMessages) {
      await setDoc(doc(db, 'messages', message.id), message);
      console.log(`✓ Added message: ${message.id}`);
    }

    // Initialize Availability (blocked dates)
    console.log('📝 Setting up availability...');
    await setDoc(doc(db, 'availability', mockListing.id), {
      listingId: mockListing.id,
      blockedDates: mockListing.blockedDates || [],
      updatedAt: new Date().toISOString()
    });
    console.log('✓ Added availability data');

    console.log('✅ Firestore initialization completed successfully!');
    console.log('🎉 Your database is ready to use!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
};
