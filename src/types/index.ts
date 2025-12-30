export interface Listing {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  amenities: string[];
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    guests: number;
    size: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    houseRules: string[];
  };
  blockedDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed';
  createdAt: string;
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancelledBy?: 'admin' | 'guest';
  cancelledAt?: string;
  cancellationReason?: string;
  refundStatus?: 'pending' | 'processed' | 'not_applicable';
  refundProcessedAt?: string | null;
  rating?: {
    score: number;
    review: string;
    createdAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guest';
  phone?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'guest';
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  bookingId?: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: { [userId: string]: number };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface CalendarSync {
  id: string;
  platform: 'airbnb' | 'booking.com' | 'vrbo';
  icalUrl: string;
  lastSyncAt: string;
  isActive: boolean;
}