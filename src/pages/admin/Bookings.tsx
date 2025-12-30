import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, User, Phone, Mail, MoreHorizontal, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { bookingService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';
import { format } from 'date-fns';

const AdminBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const allBookings = await bookingService.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesTab = activeTab === 'all' ? booking.status !== 'cancelled' : booking.status === 'cancelled';
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    setCancellingId(bookingToCancel.id);
    try {
      const result = await bookingService.cancelReservation(
        bookingToCancel.id,
        'admin',
        cancelReason || 'Cancelled by admin'
      );

      // Refresh bookings
      await fetchBookings();
      
      alert(result.message || 'Reservation cancelled successfully.');
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancelReason('');
    } catch (error: any) {
      alert(error.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRefundStatusUpdate = async (bookingId: string, newStatus: 'pending' | 'processed' | 'not_applicable') => {
    try {
      await bookingService.updateRefundStatus(bookingId, newStatus);
      await fetchBookings();
      alert('Refund status updated successfully');
    } catch (error) {
      alert('Failed to update refund status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-2">Manage all your property bookings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Active Bookings
            <span className={`ml-2 ${activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} px-2.5 py-0.5 rounded-full text-xs`}>
              {bookings.filter(b => b.status !== 'cancelled').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`${
              activeTab === 'cancelled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Cancelled Reservations
            <span className={`ml-2 ${activeTab === 'cancelled' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} px-2.5 py-0.5 rounded-full text-xs`}>
              {bookings.filter(b => b.status.toLowerCase() === 'cancelled').length}
            </span>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {activeTab === 'cancelled' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Status
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.guestName}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {booking.guestEmail}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {booking.guestPhone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</p>
                        <p className="text-gray-500">to {format(new Date(booking.checkOut), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    R{booking.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  {activeTab === 'cancelled' && (
                    <td className="px-6 py-4">
                      <select
                        value={booking.refundStatus || 'pending'}
                        onChange={(e) => handleRefundStatusUpdate(booking.id, e.target.value as any)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                        <option value="not_applicable">Not Applicable</option>
                      </select>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {activeTab === 'all' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelClick(booking)}
                          disabled={cancellingId === booking.id}
                          className="text-red-600 hover:text-red-700 disabled:text-red-400"
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
            </div>
            <div className="p-6">
              {(() => {
                const booking = bookings.find(b => b.id === selectedBooking);
                if (!booking) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Guest Information</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {booking.guestName}</p>
                          <p><span className="font-medium">Email:</span> {booking.guestEmail}</p>
                          <p><span className="font-medium">Phone:</span> {booking.guestPhone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Check-in:</span> {format(new Date(booking.checkIn), 'MMMM d, yyyy')}</p>
                          <p><span className="font-medium">Check-out:</span> {format(new Date(booking.checkOut), 'MMMM d, yyyy')}</p>
                          <p><span className="font-medium">Guests:</span> {booking.guests}</p>
                          <p><span className="font-medium">Total:</span> R{booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                    
                    {booking.specialRequests && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Update Status
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Reservation</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                Are you sure you want to cancel this reservation?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Guest:</strong> {bookingToCancel.guestName}</p>
                <p><strong>Email:</strong> {bookingToCancel.guestEmail}</p>
                <p><strong>Dates:</strong> {format(new Date(bookingToCancel.checkIn), 'MMM dd, yyyy')} - {format(new Date(bookingToCancel.checkOut), 'MMM dd, yyyy')}</p>
                <p><strong>Total:</strong> R{bookingToCancel.totalPrice}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for cancellation..."
                />
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The guest will be notified and receive a full refund.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                  setCancelReason('');
                }}
                disabled={cancellingId !== null}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {cancellingId ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;