import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Check, Star, MapPin, Wifi, Car, Flame, Coffee, Tv, Wind } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, differenceInDays } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { listingService, bookingService, availabilityService } from '../services';
import { Listing } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import ChatWidget from '../components/ChatWidget';

interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<BookingFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [pendingBookingData, setPendingBookingData] = useState<BookingFormData | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, right: 0 });
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(true);

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');

  // Fetch listing data using service
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListingById('1');
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoadingListing(false);
      }
    };

    fetchListing();
  }, []);

  // Fetch blocked dates using service
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        setIsLoadingAvailability(true);
        const dates = await availabilityService.getBlockedDates('1');
        setBlockedDates(dates);
      } catch (error) {
        console.error('Error fetching blocked dates:', error);
        setBlockedDates([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchBlockedDates();
  }, []);

  // Convert blocked date strings to Date objects for react-day-picker
  const disabledDays = blockedDates.map(dateStr => new Date(dateStr));

  // Get additional disabled dates based on selection to prevent overlapping blocked dates
  const getDisabledDaysForRange = () => {
    const disabled: any[] = [{ before: new Date() }];
    
    // If user has selected a start date, find the nearest blocked date after it
    // and disable all dates after that blocked date (but allow selecting the blocked date as checkout)
    if (dateRange?.from) {
      const startDate = dateRange.from;
      
      // Find the first blocked date after the selected start date
      const blockedDatesAfterStart = blockedDates
        .map(dateStr => new Date(dateStr))
        .filter(blockedDate => blockedDate > startDate)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (blockedDatesAfterStart.length > 0) {
        const firstBlockedDate = blockedDatesAfterStart[0];
        // Allow selecting the blocked date as checkout, but disable all dates AFTER it
        disabled.push({ after: firstBlockedDate });
      }
      
      // Also find blocked dates before the start date and disable dates before the nearest one
      const blockedDatesBeforeStart = blockedDates
        .map(dateStr => new Date(dateStr))
        .filter(blockedDate => blockedDate < startDate)
        .sort((a, b) => b.getTime() - a.getTime());
      
      if (blockedDatesBeforeStart.length > 0) {
        const lastBlockedDate = blockedDatesBeforeStart[0];
        // Disable the blocked date and all dates before it
        disabled.push(lastBlockedDate);
        disabled.push({ before: lastBlockedDate });
      }
    } else {
      // When no start date is selected, show all blocked dates
      disabled.push(...disabledDays);
    }
    
    return disabled;
  };

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    console.log('Selected range:', range);
    // If selecting a range, validate it doesn't contain blocked dates
    if (range?.from && range?.to) {
      const rangeStart = range.from;
      const rangeEnd = range.to;
      
      // Check if any blocked dates fall BETWEEN check-in and check-out (exclusive of checkout)
      // Checkout can be ON a blocked date (guest leaves that day)
      const hasBlockedBetween = blockedDates.some(dateStr => {
        const blockedDate = new Date(dateStr);
        // Blocked date must be after check-in and before check-out (not on check-out)
        return blockedDate > rangeStart && blockedDate < rangeEnd;
      });
      
      if (hasBlockedBetween) {
        // Don't allow this selection, keep only the from date
        setDateRange({ from: range.from, to: undefined });
        setValue('checkIn', format(range.from, 'yyyy-MM-dd'));
        setValue('checkOut', '');
        return;
      }
    }
    
    setDateRange(range);
    
    if (range?.from) {
      setValue('checkIn', format(range.from, 'yyyy-MM-dd'));
    } else {
      setValue('checkIn', '');
    }
    
    if (range?.to) {
      setValue('checkOut', format(range.to, 'yyyy-MM-dd'));
    } else {
      setValue('checkOut', '');
    }
    
    // Close calendar when both dates are selected
    // if (range?.from && range?.to) {
    //   setShowCalendar(false);
    // }
  };

  // Check if date range contains any blocked dates BETWEEN check-in and check-out
  // Checkout can be ON a blocked date (guest leaves that day), but not after
  const hasBlockedDatesInRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if any blocked dates fall BETWEEN check-in and check-out (exclusive of checkout)
    return blockedDates.some(dateStr => {
      const blocked = new Date(dateStr);
      // Blocked date must be after check-in and before check-out (not on check-out)
      return blocked > start && blocked < end;
    });
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !listing) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights > 0 ? nights * listing.price : 0;
  };

  const totalAmount = calculateTotal();
  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const cleaningFee = 200; // ZAR
  const serviceFee = 50; // ZAR
  const finalTotal = totalAmount + cleaningFee + serviceFee;

  const onSubmit = async (data: BookingFormData) => {
    // Check if any dates in the selected range are blocked
    if (hasBlockedDatesInRange(data.checkIn, data.checkOut)) {
      alert('Sorry, one or more dates in your selected range are unavailable. Please choose different dates.');
      return;
    }

    // If user is not logged in, show auth modal
    if (!user) {
      setPendingBookingData(data);
      setShowAuthModal(true);
      return;
    }

    await processBooking(data);
  };

  const processBooking = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      if (!listing) {
        throw new Error('Listing data not available');
      }

      const bookingData = {
        ...data,
        totalPrice: finalTotal,
        listingId: listing.id,
        guestId: user?.id || '',
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      
      // Save booking using service
      const bookingId = await bookingService.createBooking(bookingData);
      
      // Store booking data with ID for confirmation page
      const completeBookingData = {
        ...bookingData,
        id: bookingId
      };
      localStorage.setItem('pendingBooking', JSON.stringify(completeBookingData));
      
      setIsSubmitting(false);
      navigate('/booking/confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingBookingData) {
      processBooking(pendingBookingData);
      setPendingBookingData(null);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'WiFi': Wifi,
      'Parking': Car,
      'Fireplace': Flame,
      'Kitchen': Coffee,
      'TV': Tv,
      'Air Conditioning': Wind,
      'Heating': Wind,
    };
    return iconMap[amenity] || Check;
  };

  if (isLoadingListing || isLoadingAvailability) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100">
        <div className="text-center">
          <p className="text-gray-600">Unable to load listing data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Hero Section with Property Images */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={listing.images[selectedImageIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{listing.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-white/90">4.9 (127 reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-white/90">{listing.location.city}</span>
                </div>
              </div>
              <p className="text-xl text-white/90 max-w-2xl">{listing.shortDescription}</p>
            </div>
          </div>
        </div>

        {/* Image Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {listing.images.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedImageIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Property Details - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listing.specifications.guests}</div>
                  <div className="text-sm text-gray-600">Guests</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listing.specifications.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listing.specifications.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{listing.specifications.size}</div>
                  <div className="text-sm text-gray-600">Size</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About this place</h3>
                <p className="text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.amenities.map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Photo gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">House rules & policies</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Check-in: {listing.policies.checkIn}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Check-out: {listing.policies.checkOut}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{listing.policies.cancellation}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">House Rules</h4>
                <ul className="space-y-2">
                  {listing.policies.houseRules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Form - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">{formatCurrency(listing.price)}</span>
                    <span className="text-blue-100">per night</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-blue-100 text-sm">4.9 · 127 reviews</span>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="p-6">
                  {isLoadingAvailability && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Loading availability...</span>
                      </div>
                    </div>
                  )}
                  
                  {blockedDates.length > 0 && !isLoadingAvailability && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Some dates are unavailable. Please check the calendar carefully.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Dates</label>
                      <div
                        id='date-picker-input'
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          if (!isLoadingAvailability) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setCalendarPosition({
                              top: rect.bottom,
                              right: rect.left
                            });
                            setShowCalendar(!showCalendar);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className={checkIn && checkOut ? 'text-gray-900' : 'text-gray-500'}>
                              {checkIn && checkOut 
                                ? `${format(new Date(checkIn), 'MMM dd')} - ${format(new Date(checkOut), 'MMM dd, yyyy')}`
                                : 'Select check-in and check-out dates'
                              }
                            </span>
                          </div>
                          {checkIn && checkOut && (
                            <span className="text-xs text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Hidden inputs for form validation */}
                      <input type="hidden" {...register('checkIn', { required: 'Check-in date is required' })} />
                      <input type="hidden" {...register('checkOut', { 
                        required: 'Check-out date is required',
                        validate: (value) => {
                          if (checkIn && hasBlockedDatesInRange(checkIn, value)) {
                            return 'Selected range contains unavailable dates';
                          }
                          return true;
                        }
                      })} />
                      
                      {(errors.checkIn || errors.checkOut) && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.checkIn?.message || errors.checkOut?.message}
                        </p>
                      )}
                      
                      {checkIn && checkOut && hasBlockedDatesInRange(checkIn, checkOut) && (
                        <p className="text-red-500 text-xs mt-1">⚠️ Range contains blocked dates</p>
                      )}
                      
                      {/* Calendar Dropdown */}
                      {showCalendar && !isLoadingAvailability && (
                        <div 
                          className="calendar-container fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4"
                          style={{ 
                            top: `${calendarPosition.top + 8}px`, 
                            left: `calc(${calendarPosition.right}px - 327px)` 
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-gray-700">Select your dates</h4>
                            <button
                              type="button"
                              onClick={() => setShowCalendar(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <DayPicker
                              mode="range"
                              selected={dateRange}
                              onSelect={handleDateRangeSelect}
                              disabled={getDisabledDaysForRange()}
                              numberOfMonths={2}
                              pagedNavigation
                              modifiers={{
                                blocked: disabledDays
                              }}
                              modifiersStyles={{
                                disabled: { 
                                  textDecoration: 'line-through',
                                  color: '#d1d5db',
                                  backgroundColor: '#f3f4f6',
                                  cursor: 'not-allowed'
                                },
                                blocked: {
                                  textDecoration: 'line-through',
                                  color: '#ef4444',
                                  backgroundColor: '#fee2e2',
                                  fontWeight: 'bold',
                                  position: 'relative'
                                }
                              }}
                              modifiersClassNames={{
                                blocked: 'blocked-date'
                              }}
                              styles={{
                                root: { fontSize: '14px' },
                                caption: { color: '#374151', fontWeight: '600' },
                                day: { margin: '2px' },
                                months: { display: 'flex', gap: '1rem' }
                              }}
                            />
                          </div>
                          {blockedDates.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 mr-1"></span>
                                Unavailable dates
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                      <select
                        {...register('guests', { required: 'Number of guests is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {[...Array(listing.specifications.guests)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                      {errors.guests && (
                        <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    {totalAmount > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(listing.price)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cleaning fee</span>
                          <span>{formatCurrency(cleaningFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service fee</span>
                          <span>{formatCurrency(serviceFee)}</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(finalTotal)}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        {...register('guestName', { required: 'Name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your full name"
                        defaultValue={user?.name || ''}
                      />
                      {errors.guestName && (
                        <p className="text-red-500 text-xs mt-1">{errors.guestName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        {...register('guestEmail', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your email"
                        defaultValue={user?.email || ''}
                      />
                      {errors.guestEmail && (
                        <p className="text-red-500 text-xs mt-1">{errors.guestEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        {...register('guestPhone', { required: 'Phone number is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your phone number"
                        defaultValue={user?.phone || ''}
                      />
                      {errors.guestPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.guestPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <textarea
                        {...register('specialRequests')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Any special requests..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || totalAmount === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        `Reserve for ${formatCurrency(finalTotal)}`
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      {!user && 'You\'ll be asked to create an account before payment. '}
                      Payment is due upon arrival.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Booking;