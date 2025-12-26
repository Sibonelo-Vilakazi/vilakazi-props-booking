import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Mail, Phone, ArrowLeft } from 'lucide-react';
import { listingService, bookingService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import { format, differenceInDays } from 'date-fns';
import { Booking, Listing } from '../types';
import RatingModal from '../components/RatingModal';

const ReservationDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching reservation details for bookingId:', bookingId);
      console.log('Current user:', user);

      if (!user) {
        setIsLoading(false);
        return;
      }
      if (!bookingId) {
        navigate('/reservations');
        return;
      }

      try {
        // Fetch booking
        const bookingData = await bookingService.getBookingById(bookingId);
        console.log('Fetched booking data:', bookingData);
        if (!bookingData) {
          navigate('/reservations');
          return;
        }

        // Check if user owns this booking
        if (bookingData.guestId !== user?.id) {
          navigate('/reservations');
          return;
        }

        setReservation(bookingData);

        // Fetch listing
        const listingData = await listingService.getListingById(bookingData.listingId || '1');
        setListing(listingData);
      } catch (error) {
        console.error('Error fetching reservation:', error);
        navigate('/reservations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId, user, navigate]);

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Booking['paymentStatus']) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      paid: 'bg-green-50 text-green-700 border-green-200',
      refunded: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${styles[status]}`}>
        Payment {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    // Refresh the booking to get the updated rating
    if (bookingId) {
      bookingService.getBookingById(bookingId).then(updatedBooking => {
        if (updatedBooking) {
          setReservation(updatedBooking);
        }
      });
    }
  };

  if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your reservations</h2>
            <p className="text-gray-600 mb-6">Please log in to see your booking history</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (!reservation || !listing) {
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">

    </div>
    return null;
  }

  const nights = differenceInDays(new Date(reservation.checkOut), new Date(reservation.checkIn));

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/reservations')}
          className="group flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Reservations
        </button>

        {/* Header Card with Property Image */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{listing.title}</h1>
              <div className="flex items-center text-white/90 text-sm sm:text-base">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{listing.location.address}, {listing.location.city}</span>
              </div>
            </div>
          </div>

          {/* Status and Booking Info */}
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                <p className="text-lg font-semibold text-gray-900">#{reservation.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(reservation.status)}
                {getPaymentStatusBadge(reservation.paymentStatus)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stay Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                Stay Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Check-in</p>
                  <p className="text-xl font-bold text-gray-900">
                    {format(new Date(reservation.checkIn), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(reservation.checkIn), 'EEEE')} • After {listing.policies.checkIn}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Check-out</p>
                  <p className="text-xl font-bold text-gray-900">
                    {format(new Date(reservation.checkOut), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(reservation.checkOut), 'EEEE')} • Before {listing.policies.checkOut}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{nights} nights</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="text-lg font-semibold text-gray-900">{reservation.guests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h3>
              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Guest Name</p>
                    <p className="text-base font-semibold text-gray-900">{reservation.guestName}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <a href={`mailto:${reservation.guestEmail}`} className="text-base font-medium text-blue-600 hover:text-blue-700">
                      {reservation.guestEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <a href={`tel:${reservation.guestPhone}`} className="text-base font-medium text-blue-600 hover:text-blue-700">
                      {reservation.guestPhone}
                    </a>
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Special Requests</p>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <p className="text-gray-900 text-sm leading-relaxed">{reservation.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Section */}
            {reservation.status === 'completed' && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-400" />
                  Your Review
                </h3>
                {reservation.rating ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < reservation.rating!.score
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{reservation.rating.score}.0</span>
                      <span className="text-gray-500 ml-1">/5</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{reservation.rating.review}</p>
                    <p className="text-sm text-gray-500">
                      Reviewed on {format(new Date(reservation.rating.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                        <Star className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">Share Your Experience</p>
                    <p className="text-gray-600 mb-6 text-sm">Help others by reviewing your stay</p>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">
                    {formatCurrency(listing.price)} × {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold">{formatCurrency((listing.price || 0) * nights)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Cleaning fee</span>
                  <span className="font-semibold">{formatCurrency(200)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Service fee</span>
                  <span className="font-semibold">{formatCurrency(50)}</span>
                </div>
                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(reservation.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Booked on {format(new Date(reservation.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={handleRatingClose}
        bookingId={reservation.id}
        propertyName={listing.title}
      />
    </div>
  );
};

export default ReservationDetail;
