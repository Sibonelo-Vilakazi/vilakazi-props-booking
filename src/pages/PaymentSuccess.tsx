import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Users, MapPin, DollarSign, Home, Download, Share2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { bookingService } from '../services';
import { formatCurrency } from '../utils/currency';

interface BookingData {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
  propertyTitle?: string;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Try to get booking ID from URL params
        //const bookingId = searchParams.get('bookingId');
        
        if (bookingId) {
          // Fetch from Firebase
          const bookingData = await bookingService.getBookingById(bookingId);
          if (bookingData) {
            setBooking(bookingData as BookingData);
          }
        } else {
          // Fallback to localStorage
          const savedBooking = localStorage.getItem('pendingBooking');
          if (savedBooking) {
            const bookingData = JSON.parse(savedBooking);
            setBooking(bookingData);
            // Update booking status in Firebase
            if (bookingData.id) {
              await bookingService.updateBooking(bookingData.id, {
                status: 'paid',
                paymentStatus: 'paid'
              });
            }
            localStorage.removeItem('pendingBooking');
          }
        }
      } catch (error) {
        console.error('Error loading booking data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [searchParams]);

  const handleDownloadReceipt = () => {
    // TODO: Implement PDF generation
    alert('Receipt download will be implemented soon!');
  };

  const handleShare = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'My Booking Confirmation',
          text: `I've booked ${booking.propertyTitle || 'a property'} from ${format(new Date(booking.checkIn), 'MMM dd')} to ${format(new Date(booking.checkOut), 'MMM dd, yyyy')}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your confirmation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No booking information found</p>
          <Link
            to="/booking"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Make a new booking
          </Link>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = differenceInDays(checkOutDate, checkInDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your booking has been confirmed</p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90">Booking Reference</p>
                <p className="text-2xl font-bold">#{booking.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-90">Total Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(booking.totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Check-in */}
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-in</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(checkInDate, 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">After 3:00 PM</p>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-out</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(checkOutDate, 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">Before 11:00 AM</p>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Guests</p>
                  <p className="text-lg font-bold text-gray-900">
                    {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                  </p>
                  <p className="text-sm text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>

              {/* Property */}
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Property</p>
                  <p className="text-lg font-bold text-gray-900">
                    {booking.propertyTitle || 'Luxury Vilakazi Props'}
                  </p>
                  <p className="text-sm text-gray-600">Aspen, Colorado</p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{booking.guestEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{booking.guestPhone}</p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Special Requests</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-200 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Booking</span>
          </button>

          <Link
            to="/reservations"
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>View All Bookings</span>
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>A confirmation email has been sent to {booking.guestEmail}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>You can view and manage your booking in your reservations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>We'll send you check-in details 24 hours before your arrival</span>
            </li>
          </ul>
        </div>

        {/* Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
