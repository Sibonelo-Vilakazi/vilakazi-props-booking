import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import ReservationHistory from './pages/ReservationHistory';
import ReservationDetail from './pages/ReservationDetail';
import InitializeDatabase from './pages/InitializeDatabase';
import ForgotPassword from './pages/ForgotPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import TermsAndConditions from './pages/TermsAndConditions';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminMessages from './pages/admin/Messages';
import ListingManagement from './pages/admin/ListingManagement';
import AdminSettings from './pages/admin/Settings';
import CalendarSync from './pages/admin/CalendarSync';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/booking" element={<Layout><Booking /></Layout>} />
          <Route path="/booking/confirmation" element={<Layout><BookingConfirmation /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/location" element={<Layout><Contact /></Layout>} />
          <Route path="/reservations" element={<Layout><ReservationHistory /></Layout>} />
          <Route path="/reservations/:bookingId" element={<Layout><ReservationDetail /></Layout>} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment/success/:bookingId" element={<PaymentSuccess />} />
          <Route path="/payment/failed/:bookingId" element={<PaymentFailed />} />
          <Route path="/initialize-db" element={<InitializeDatabase />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute>
              <AdminLayout><AdminBookings /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute>
              <AdminLayout><AdminMessages /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/listing" element={
            <ProtectedRoute>
              <AdminLayout><ListingManagement /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/calendar" element={
            <ProtectedRoute>
              <AdminLayout><CalendarSync /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout><AdminSettings /></AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;