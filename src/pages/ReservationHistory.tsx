import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, X, Mail, Phone } from 'lucide-react';
import { listingService, bookingService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import { format, differenceInDays, isFuture } from 'date-fns';
import { Booking, Listing } from '../types';

const ReservationHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedReservation, setSelectedReservation] = useState<Booking | null>(null);
  const [userReservations, setUserReservations] = useState<Booking[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's reservations using service
  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's bookings
        const reservations = await bookingService.getBookingsByUserId(user.id);
        setUserReservations(reservations);

        // Fetch listing data
        const listingData = await listingService.getListingById('1');
        setListing(listingData);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  // Filter reservations based on selected filter
  const filteredReservations = useMemo(() => {
    let filtered = [...userReservations];

    switch (selectedFilter) {
      case 'upcoming':
        filtered = filtered.filter(r => 
          (r.status === 'confirmed' || r.status === 'pending') && 
          isFuture(new Date(r.checkIn))
        );
        break;
      case 'completed':
        filtered = filtered.filter(r => r.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(r => r.status === 'cancelled');
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Sort by check-in date, newest first
    return filtered.sort((a, b) => 
      new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
    );
  }, [userReservations, selectedFilter]);

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
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
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
          <p className="mt-4 text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Reservations</h1>
          <p className="text-gray-600">View and manage your booking history</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Bookings', count: userReservations.length },
            { key: 'upcoming', label: 'Upcoming', count: userReservations.filter(r => (r.status === 'confirmed' || r.status === 'pending') && isFuture(new Date(r.checkIn))).length },
            { key: 'completed', label: 'Completed', count: userReservations.filter(r => r.status === 'completed').length },
            { key: 'cancelled', label: 'Cancelled', count: userReservations.filter(r => r.status === 'cancelled').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600 mb-6">
              {selectedFilter === 'all' 
                ? "You haven't made any bookings yet"
                : `No ${selectedFilter} reservations`}
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Book Your Stay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReservations.map((reservation) => {
              const nights = differenceInDays(new Date(reservation.checkOut), new Date(reservation.checkIn));
              
              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedReservation(reservation)}
                >
                  <div className="md:flex">
                    {/* Property Image */}
                    <div className="md:w-64 h-48 md:h-auto">
                      <img
                        src={listing?.images[0] || ''}
                        alt={listing?.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{listing?.title || 'Property'}</h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {listing?.location.city || 'Location'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(reservation.status)}
                          {getPaymentStatusBadge(reservation.paymentStatus)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Check-in</div>
                            <div className="font-medium">{format(new Date(reservation.checkIn), 'MMM dd, yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Check-out</div>
                            <div className="font-medium">{format(new Date(reservation.checkOut), 'MMM dd, yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Guests</div>
                            <div className="font-medium">{reservation.guests} guest{reservation.guests > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {nights} night{nights !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Price</div>
                          <div className="text-2xl font-bold text-gray-900">{formatCurrency(reservation.totalPrice)}</div>
                        </div>
                      </div>

                      {reservation.rating && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < reservation.rating!.score
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Your Rating
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{reservation.rating.review}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Property Info */}
              <div className="mb-6">
                <img
                  src={listing?.images[0] || ''}
                  alt={listing?.title || 'Property'}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{listing?.title || 'Property'}</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing?.location.address || 'Address not available'}
                </div>
              </div>

              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Booking Status</div>
                  {getStatusBadge(selectedReservation.status)}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                  {getPaymentStatusBadge(selectedReservation.paymentStatus)}
                </div>
              </div>

              {/* Dates and Guests */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Check-in</div>
                    <div className="font-semibold text-gray-900">
                      {format(new Date(selectedReservation.checkIn), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">After {listing?.policies.checkIn || '3:00 PM'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Check-out</div>
                    <div className="font-semibold text-gray-900">
                      {format(new Date(selectedReservation.checkOut), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">Before {listing?.policies.checkOut || '10:00 AM'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Number of Guests</div>
                    <div className="font-semibold text-gray-900">
                      {selectedReservation.guests} guest{selectedReservation.guests > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                    <div className="font-mono text-sm text-gray-900">{selectedReservation.id}</div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.specialRequests && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Special Requests</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-700">
                    {selectedReservation.specialRequests}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-4">Price Breakdown</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>
                      {formatCurrency(listing?.price || 0)} × {differenceInDays(new Date(selectedReservation.checkOut), new Date(selectedReservation.checkIn))} nights
                    </span>
                    <span className="font-medium">{formatCurrency(selectedReservation.totalPrice - 250)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span className="font-medium">{formatCurrency(200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span className="font-medium">{formatCurrency(50)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(selectedReservation.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedReservation.guestName}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedReservation.guestEmail}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedReservation.guestPhone}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {selectedReservation.status === 'confirmed' && isFuture(new Date(selectedReservation.checkIn)) && (
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Cancel Booking
                  </button>
                )}
                {selectedReservation.status === 'completed' && !selectedReservation.rating && (
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Leave a Review
                  </button>
                )}
                <button 
                  onClick={() => setSelectedReservation(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
