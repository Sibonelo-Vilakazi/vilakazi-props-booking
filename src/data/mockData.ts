import { Listing, Booking, Message } from '../types';

export const mockListing: Listing = {
  id: '1',
  title: 'Vilakazi Props',
  description: `Spacious Accommodations: Unit at The Base Apartment in Randburg offers spacious bed and breakfast rooms with private bathrooms, kitchens, and work desks. Free WiFi is available throughout the property.

Outdoor Leisure: Guests can enjoy a year-round outdoor swimming pool and relax in the sun. Free on-site private parking ensures convenience.

Convenient Location: Located 14 mi from Lanseria International Airport, the property is close to attractions such as Sandton City Mall (5 mi) and Montecasino (5.6 mi). Highly rated for room cleanliness.`,
  shortDescription: 'Stunning Vilakazi Props with panoramic views, luxury amenities, and perfect location for outdoor adventures.',
  price: 500, // Updated to ZAR
  images: [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/19c9ef80-a2dd-4d01-8b3b-1bd6bde1749b.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/d9b6dbca-359d-4294-b626-ee40d76db44a.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/905e3e94-dfdd-462a-8340-5ec5ca7b41bc.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/b3bb02d1-c80d-46ae-af11-b96e54ac6ba2.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/6b963e26-ff54-47f9-90e2-b9c65a2e5512.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1511776359658637046/original/3274e244-5f2c-47aa-991a-8e46d0c93c4b.jpeg?im_w=720',
  ],
  amenities: [
    'WiFi',
    'Kitchen',
    'Parking',
    'Shower',
    'Fireplace',
    // 'Mountain Views',
    'Hiking Trails',
    // 'Pet Friendly',
    'BBQ Grill',
    'Swimming Pool',
    // 'Air Conditioning',
    'Heater'
  ],
  location: {
    address: '323 Surrey Ave, Ferndale',
    city: 'Randburg, Gauteng',
    coordinates: {
      lat: -26.0990106,
      lng: 28.0537363
    }
  },
  specifications: {
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    size: '409 sq ft'
  },
  policies: {
    checkIn: '3:00 PM',
    checkOut: '10:00 AM',
    cancellation: 'Free cancellation 48 hours before check-in',
    houseRules: [
      'No smoking indoors',
      'No parties or events',
      'Pets allowed with approval',
      'Quiet hours: 10 PM - 8 AM',
      'Maximum 2 guests'
    ]
  },
  blockedDates: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockBookings: Booking[] = [
  {
    id: '1',
    listingId: '1',
    guestId: 'guest1',
    guestName: 'John & Sarah Smith',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+27 82 123 4567',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    guests: 2,
    totalPrice: 7500, // Updated to ZAR
    status: 'confirmed',
    createdAt: '2024-02-01T10:30:00Z',
    specialRequests: 'Anniversary celebration - would love some local restaurant recommendations',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    listingId: '1',
    guestId: 'guest2',
    guestName: 'Emily Johnson',
    guestEmail: 'emily.j@email.com',
    guestPhone: '+27 83 987 6543',
    checkIn: '2024-02-22',
    checkOut: '2024-02-25',
    guests: 4,
    totalPrice: 7500, // Updated to ZAR
    status: 'paid',
    createdAt: '2024-02-05T14:15:00Z',
    paymentStatus: 'paid'
  },
  {
    id: '3',
    listingId: '1',
    guestId: 'guest3',
    guestName: 'Michael Brown',
    guestEmail: 'mbrown@email.com',
    guestPhone: '+27 84 456 7890',
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 6,
    totalPrice: 10000, // Updated to ZAR
    status: 'confirmed',
    createdAt: '2024-02-10T09:20:00Z',
    specialRequests: 'Traveling with two small children - need crib if available',
    paymentStatus: 'pending'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'guest1',
    senderName: 'Lisa Wilson',
    senderRole: 'guest',
    receiverId: 'admin1',
    content: 'Hi! I am interested in booking your property for March 15-20. Is it available? Also, do you allow pets?',
    createdAt: '2024-02-12T08:45:00Z',
    read: false
  },
  {
    id: '2',
    senderId: 'guest2',
    senderName: 'David Chen',
    senderRole: 'guest',
    receiverId: 'admin1',
    content: 'We are planning a small wedding celebration and looking for accommodation for our guests. Could you provide information about group bookings?',
    createdAt: '2024-02-11T16:30:00Z',
    read: true
  }
];

// Mock user reservations - organized by user ID for easy lookup
export const mockUserReservations: { [userId: string]: Booking[] } = {
  'guest1': [
    {
      id: 'res1',
      listingId: '1',
      guestId: 'guest1',
      guestName: 'John Smith',
      guestEmail: 'guest@example.com',
      guestPhone: '+27 83 456 7890',
      checkIn: '2025-01-15',
      checkOut: '2025-01-18',
      guests: 2,
      totalPrice: 2250,
      status: 'completed',
      createdAt: '2025-01-01T10:30:00Z',
      specialRequests: 'Early check-in if possible',
      paymentStatus: 'paid',
      rating: {
        score: 5,
        review: 'Amazing property! Clean, spacious, and the view was breathtaking. Would definitely stay again.',
        createdAt: '2025-01-19T09:00:00Z'
      }
    },
    {
      id: 'res2',
      listingId: '1',
      guestId: 'guest1',
      guestName: 'John Smith',
      guestEmail: 'guest@example.com',
      guestPhone: '+27 83 456 7890',
      checkIn: '2025-02-10',
      checkOut: '2025-02-14',
      guests: 2,
      totalPrice: 3000,
      status: 'confirmed',
      createdAt: '2025-01-28T14:20:00Z',
      paymentStatus: 'paid'
    },
    {
      id: 'res3',
      listingId: '1',
      guestId: 'guest1',
      guestName: 'John Smith',
      guestEmail: 'guest@example.com',
      guestPhone: '+27 83 456 7890',
      checkIn: '2025-03-20',
      checkOut: '2025-03-25',
      guests: 2,
      totalPrice: 3750,
      status: 'pending',
      createdAt: '2025-12-20T11:15:00Z',
      specialRequests: 'Anniversary trip - any special recommendations?',
      paymentStatus: 'pending'
    }
  ],
  'guest2': [
    {
      id: 'res4',
      listingId: '1',
      guestId: 'guest2',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      guestPhone: '+27 84 567 8901',
      checkIn: '2024-12-15',
      checkOut: '2024-12-20',
      guests: 2,
      totalPrice: 3750,
      status: 'completed',
      createdAt: '2024-12-01T09:45:00Z',
      paymentStatus: 'paid',
      rating: {
        score: 4,
        review: 'Great location and beautiful property. Only minor issue was the WiFi was a bit slow.',
        createdAt: '2024-12-21T10:30:00Z'
      }
    },
    {
      id: 'res5',
      listingId: '1',
      guestId: 'guest2',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      guestPhone: '+27 84 567 8901',
      checkIn: '2025-01-25',
      checkOut: '2025-01-27',
      guests: 2,
      totalPrice: 1500,
      status: 'cancelled',
      createdAt: '2025-01-10T16:00:00Z',
      specialRequests: 'Had to cancel due to work emergency',
      paymentStatus: 'refunded'
    }
  ]
};