import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, Home, Phone, Mail, HelpCircle } from 'lucide-react';

interface FailureReason {
  code: string;
  title: string;
  description: string;
  suggestion: string;
}

const FAILURE_REASONS: Record<string, FailureReason> = {
  'insufficient_funds': {
    code: 'insufficient_funds',
    title: 'Insufficient Funds',
    description: 'Your payment method does not have enough funds to complete this transaction.',
    suggestion: 'Please try a different payment method or add funds to your account.'
  },
  'card_declined': {
    code: 'card_declined',
    title: 'Card Declined',
    description: 'Your card was declined by your bank.',
    suggestion: 'Please contact your bank for more information or try another payment method.'
  },
  'expired_card': {
    code: 'expired_card',
    title: 'Expired Card',
    description: 'The card you used has expired.',
    suggestion: 'Please use a valid card or update your payment information.'
  },
  'processing_error': {
    code: 'processing_error',
    title: 'Processing Error',
    description: 'There was an error processing your payment.',
    suggestion: 'This is usually temporary. Please try again in a few moments.'
  },
  'timeout': {
    code: 'timeout',
    title: 'Payment Timeout',
    description: 'Your payment session has expired.',
    suggestion: 'Please start a new booking and try again.'
  },
  'cancelled': {
    code: 'cancelled',
    title: 'Payment Cancelled',
    description: 'You cancelled the payment process.',
    suggestion: 'You can try again whenever you\'re ready.'
  },
  'default': {
    code: 'unknown',
    title: 'Payment Failed',
    description: 'We were unable to process your payment.',
    suggestion: 'Please try again or contact our support team for assistance.'
  }
};

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<any>(null);
  const [failureReason, setFailureReason] = useState<FailureReason>(FAILURE_REASONS.default);

  useEffect(() => {
    // Get failure reason from URL params
    const reason = searchParams.get('reason') || 'default';
    setFailureReason(FAILURE_REASONS[reason] || FAILURE_REASONS.default);

    // Try to retrieve booking data from localStorage
    const savedBooking = localStorage.getItem('pendingBooking');
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    }
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (bookingData) {
      // Navigate back to booking with saved data
      navigate('/booking', { state: { retryBooking: bookingData } });
    } else {
      navigate('/booking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-xl text-gray-600">We couldn't process your payment</p>
        </div>

        {/* Failure Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-red-500 px-8 py-4">
            <p className="text-white font-semibold text-lg">{failureReason.title}</p>
          </div>

          <div className="p-8">
            {/* Error Details */}
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What happened?</h3>
                  <p className="text-gray-700">{failureReason.description}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 mb-6">
                <HelpCircle className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What can you do?</h3>
                  <p className="text-gray-700">{failureReason.suggestion}</p>
                </div>
              </div>
            </div>

            {/* Booking Info if available */}
            {bookingData && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Booking Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest:</span>
                    <span className="font-medium text-gray-900">{bookingData.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(bookingData.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(bookingData.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-900 font-semibold">Total Amount:</span>
                    <span className="font-bold text-gray-900">
                      ${bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Don't worry - your booking details are saved and you can retry the payment.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Payment Again</span>
              </button>

              <Link
                to="/booking"
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
              >
                <span>Modify Booking</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3">
            <a
              href="tel:+27821234567"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-gray-600">+27 82 123 4567</p>
              </div>
            </a>

            <a
              href="mailto:support@vilakazi-props.com"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-gray-600">support@vilakazi-props.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">Common Issues & Solutions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check that your card details are entered correctly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure you have sufficient funds or credit limit</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Verify your card is authorized for online payments</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Try using a different payment method</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Contact your bank if the issue persists</span>
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

export default PaymentFailed;
