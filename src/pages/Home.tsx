import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Bed, Bath, Wifi, Car, Flame } from 'lucide-react';
import { listingService } from '../services';
import { Listing } from '../types';

const Home: React.FC = () => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListingById('1');
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, []);

  const featuredAmenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Car, name: 'Free Parking' },
    { icon: Flame, name: 'Fireplace' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load listing data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={listing.images[0]}
            alt="Vilakazi Props"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Luxury Vilakazi Props
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Escape to breathtaking mountain views and unmatched comfort in our stunning luxury cabin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book Your Stay
            </Link>
            <Link
              to="/gallery"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border border-white/30"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white shadow-lg -mt-20 relative z-20 mx-4 sm:mx-8 lg:mx-16 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bed className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{listing.specifications.bedrooms}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Bedrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bath className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{listing.specifications.bathrooms}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Bathrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{listing.specifications.guests}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Guests</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-lg font-bold text-gray-900">CO</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Colorado</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Perfect Mountain Getaway
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {listing.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {featuredAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                    <amenity.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">4.9/5 based on 127 reviews</span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={listing.images[1]}
                  alt="Interior view"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src={listing.images[2]}
                  alt="Bedroom view"
                  className="rounded-lg shadow-lg mt-8"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">R{listing.price}</div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Preview */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect Location
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Nestled in the heart of Colorado's mountains, our retreat offers easy access to hiking trails, 
              ski slopes, and charming mountain towns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Prime Location</h3>
              <p className="text-gray-600">
                Just 15 minutes from downtown Aspen Valley with stunning mountain views
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Outdoor Activities</h3>
              <p className="text-gray-600">
                Hiking, skiing, mountain biking, and more adventures at your doorstep
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Attractions</h3>
              <p className="text-gray-600">
                Restaurants, shops, and cultural attractions within easy reach
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Your Mountain Adventure?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Book your stay today and create unforgettable memories in our luxury Vilakazi Props
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Check Availability
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;