import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
                <p className="text-sm text-gray-600">Last updated: December 30, 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Vilakazi Props Booking. By accessing and using our property booking platform, 
              you agree to be bound by these Terms and Conditions. Please read them carefully before 
              making any reservation. If you do not agree with any part of these terms, please do not 
              use our services.
            </p>
          </section>

          {/* Booking and Payment */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. Booking and Payment</h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>2.1 Reservation Confirmation:</strong> Your booking is confirmed only after 
                successful payment and receipt of a confirmation email from our system.
              </p>
              <p>
                <strong>2.2 Payment:</strong> Full payment is required at the time of booking. We accept 
                major credit cards and other payment methods as displayed on our platform.
              </p>
              <p>
                <strong>2.3 Pricing:</strong> All prices are listed in South African Rand (ZAR) and 
                include applicable taxes unless otherwise stated. Additional fees such as cleaning fees 
                and service fees are clearly displayed before payment.
              </p>
              <p>
                <strong>2.4 Price Changes:</strong> Prices are subject to change, but any changes will 
                not affect confirmed bookings.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Cancellation Policy</h2>
              </div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-800 font-semibold">
                Important: Please review our cancellation policy carefully before making a reservation.
              </p>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>3.1 Guest Cancellation Window:</strong> Guests may cancel their reservation and 
                receive a full refund if the cancellation is made at least <span className="font-bold text-red-600">48 hours (2 days) 
                before the scheduled check-in time</span>.
              </p>
              <p>
                <strong>3.2 Late Cancellation:</strong> Cancellations made less than 48 hours before 
                check-in will not be eligible for a refund. The full booking amount will be retained.
              </p>
              <p>
                <strong>3.3 No-Show:</strong> If you do not arrive at the property without cancelling 
                your reservation, no refund will be provided.
              </p>
              <p>
                <strong>3.4 Admin Cancellation:</strong> The property owner or administrator reserves 
                the right to cancel any reservation for any reason. In such cases, you will receive a 
                full refund of all payments made.
              </p>
              <p>
                <strong>3.5 Refund Processing:</strong> Approved refunds will be processed within 5-10 
                business days and will be credited back to the original payment method used for the booking.
              </p>
              <p>
                <strong>3.6 How to Cancel:</strong> To cancel your reservation, log in to your account, 
                go to "Reservation History," find your booking, and click the "Cancel Reservation" button. 
                Cancellation requests must be submitted through our platform to be valid.
              </p>
            </div>
          </section>

          {/* Check-in and Check-out */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Check-in and Check-out</h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>4.1 Check-in Time:</strong> Standard check-in time is 2:00 PM unless otherwise 
                specified in your booking confirmation. Early check-in may be available upon request 
                and subject to availability.
              </p>
              <p>
                <strong>4.2 Check-out Time:</strong> Standard check-out time is 11:00 AM. Late check-out 
                may be arranged in advance and may incur additional charges.
              </p>
              <p>
                <strong>4.3 Key Collection:</strong> Instructions for key collection will be provided 
                in your confirmation email. Please ensure you have a valid government-issued ID for verification.
              </p>
            </div>
          </section>

          {/* Property Rules */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Shield className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Property Rules and Guest Responsibilities</h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>5.1 Maximum Occupancy:</strong> The number of guests must not exceed the maximum 
                occupancy stated in the property listing. Unauthorized guests are not permitted.
              </p>
              <p>
                <strong>5.2 Property Care:</strong> Guests are responsible for treating the property with 
                respect and care. Any damage beyond normal wear and tear may result in additional charges.
              </p>
              <p>
                <strong>5.3 Noise and Disturbances:</strong> Guests must respect quiet hours and avoid 
                causing disturbances to neighbors or other guests.
              </p>
              <p>
                <strong>5.4 Smoking and Pets:</strong> Smoking and pets are only allowed if explicitly 
                stated in the property listing. Violations may result in additional cleaning fees.
              </p>
              <p>
                <strong>5.5 Illegal Activities:</strong> Any illegal activities on the property are 
                strictly prohibited and will result in immediate termination of the reservation without refund.
              </p>
            </div>
          </section>

          {/* Liability and Insurance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Liability and Insurance</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>6.1 Personal Belongings:</strong> We are not responsible for any loss, theft, 
                or damage to guests' personal belongings during their stay.
              </p>
              <p>
                <strong>6.2 Property Damage:</strong> Guests are liable for any damage they cause to 
                the property or its contents. We reserve the right to charge for repairs or replacement.
              </p>
              <p>
                <strong>6.3 Personal Injury:</strong> We are not liable for any personal injury or 
                accidents that occur on the property unless caused by our proven negligence.
              </p>
              <p>
                <strong>6.4 Travel Insurance:</strong> We strongly recommend that guests obtain 
                appropriate travel insurance to cover cancellations, medical emergencies, and personal liability.
              </p>
            </div>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>7.1 Data Collection:</strong> We collect personal information necessary to 
                process your booking, including name, email, phone number, and payment details.
              </p>
              <p>
                <strong>7.2 Data Usage:</strong> Your information will be used solely for booking 
                management, customer service, and communication regarding your reservation.
              </p>
              <p>
                <strong>7.3 Data Security:</strong> We implement appropriate security measures to 
                protect your personal information from unauthorized access or disclosure.
              </p>
              <p>
                <strong>7.4 Third-Party Sharing:</strong> We do not sell or share your personal 
                information with third parties except as necessary to process your booking (e.g., payment processors).
              </p>
            </div>
          </section>

          {/* Modifications and Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications to Terms</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be 
                effective immediately upon posting on our website. Continued use of our services after 
                changes constitutes acceptance of the modified terms.
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>9.1 Contact First:</strong> In the event of any dispute, please contact us 
                first at support@vilakazi-props.com to attempt to resolve the matter amicably.
              </p>
              <p>
                <strong>9.2 Governing Law:</strong> These Terms and Conditions are governed by the 
                laws of South Africa.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                For questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Email:</strong> support@vilakazi-props.com</p>
                <p><strong>Phone:</strong> +27 11 234 5678</p>
                <p><strong>Address:</strong> Johannesburg, South Africa</p>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t pt-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-blue-900 text-sm">
                  By creating an account and/or making a booking on our platform, you acknowledge that 
                  you have read, understood, and agree to be bound by these Terms and Conditions, 
                  including our Cancellation Policy.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            I Understand
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
