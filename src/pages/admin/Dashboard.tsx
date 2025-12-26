import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, MessageSquare, TrendingUp, Home } from 'lucide-react';
import { bookingService, listingService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, Listing } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [allBookings, allListings] = await Promise.all([
        bookingService.getAllBookings(),
        listingService.getAllListings()
      ]);
      setBookings(allBookings);
      setListings(allListings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(b => new Date(b.checkIn) > new Date()).length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const unreadMessages = 0; // TODO: Implement messages from Firebase

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Upcoming Stays',
      value: upcomingBookings,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'bg-orange-500',
      change: '+3'
    }
  ];

  const recentBookings = bookings.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your property.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guestName}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(booking.totalPrice)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Property Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Property Overview</h2>
          </div>
          <div className="p-6">
            {listings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No properties listed</p>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{listing.location.city}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{listing.specifications.bedrooms} bed</span>
                        <span>{listing.specifications.bathrooms} bath</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(listing.price)}/night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">{day}</p>
                <div className="space-y-1">
                  {Math.random() > 0.5 ? (
                    <div className="w-full h-8 bg-blue-100 rounded text-xs flex items-center justify-center text-blue-800">
                      Booked
                    </div>
                  ) : (
                    <div className="w-full h-8 bg-gray-50 rounded text-xs flex items-center justify-center text-gray-500">
                      Available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;