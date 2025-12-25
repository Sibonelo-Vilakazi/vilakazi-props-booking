import React, { useState, useEffect } from 'react';
import { Calendar, Download, Upload, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { generateICalendar, parseICalendar } from '../../utils/ical';
import { mockBookings, mockListing } from '../../data/mockData';
import { CalendarSync } from '../../types';

interface ICalFormData {
  platform: 'airbnb' | 'booking.com' | 'vrbo';
  icalUrl: string;
}

const CalendarSyncPage: React.FC = () => {
  const [syncedCalendars, setSyncedCalendars] = useState<CalendarSync[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedICalUrl, setGeneratedICalUrl] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ICalFormData>();

  useEffect(() => {
    // Load existing calendar syncs from localStorage (in production, this would be from Firebase)
    const saved = localStorage.getItem('calendarSyncs');
    if (saved) {
      setSyncedCalendars(JSON.parse(saved));
    }
  }, []);

  const generateOurICalendar = async () => {
    setIsGenerating(true);
    try {
      const icalData = generateICalendar(mockBookings, mockListing.title);
      
      // Create a blob and URL for download
      const blob = new Blob([icalData], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      setGeneratedICalUrl(url);
      
      // Auto-download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mountain-retreat-calendar.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating iCal:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addCalendarSync = async (data: ICalFormData) => {
    try {
      // Test the iCal URL
      await parseICalendar(data.icalUrl);
      
      const newSync: CalendarSync = {
        id: Date.now().toString(),
        platform: data.platform,
        icalUrl: data.icalUrl,
        lastSyncAt: new Date().toISOString(),
        isActive: true
      };
      
      const updated = [...syncedCalendars, newSync];
      setSyncedCalendars(updated);
      localStorage.setItem('calendarSyncs', JSON.stringify(updated));
      
      reset();
    } catch (error) {
      console.error('Error adding calendar sync:', error);
      alert('Failed to add calendar sync. Please check the URL.');
    }
  };

  const removeCalendarSync = (id: string) => {
    const updated = syncedCalendars.filter(sync => sync.id !== id);
    setSyncedCalendars(updated);
    localStorage.setItem('calendarSyncs', JSON.stringify(updated));
  };

  const syncCalendar = async (sync: CalendarSync) => {
    try {
      const blockedDates = await parseICalendar(sync.icalUrl);
      console.log(`Synced ${blockedDates.length} blocked dates from ${sync.platform}`);
      
      // Update last sync time
      const updated = syncedCalendars.map(s => 
        s.id === sync.id ? { ...s, lastSyncAt: new Date().toISOString() } : s
      );
      setSyncedCalendars(updated);
      localStorage.setItem('calendarSyncs', JSON.stringify(updated));
      
      alert(`Successfully synced ${blockedDates.length} blocked dates from ${sync.platform}`);
    } catch (error) {
      console.error('Error syncing calendar:', error);
      alert('Failed to sync calendar. Please check the URL.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar Synchronization</h1>
        <p className="text-gray-600 mt-2">Sync your calendar with Airbnb, Booking.com, and other platforms</p>
      </div>

      {/* Export Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export Your Calendar</h2>
            <p className="text-gray-600">Generate an iCal file to import into Airbnb, Booking.com, or other platforms</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to use this calendar:</h3>
          <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1">
            <li>Click "Generate iCal" to download your calendar file</li>
            <li>Go to your Airbnb host dashboard → Calendar → Availability settings</li>
            <li>Click "Import calendar" and upload the downloaded file</li>
            <li>For Booking.com: Go to Property → Calendar → Import/Export → Import calendar</li>
          </ol>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={generateOurICalendar}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{isGenerating ? 'Generating...' : 'Generate iCal'}</span>
          </button>
          
          {generatedICalUrl && (
            <a
              href={generatedICalUrl}
              download="mountain-retreat-calendar.ics"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download Again</span>
            </a>
          )}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Calendar URL for external platforms:</strong><br />
            <code className="bg-white px-2 py-1 rounded text-xs">
              https://your-domain.com/api/calendar/mountain-retreat.ics
            </code>
          </p>
        </div>
      </div>

      {/* Import Calendars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import External Calendars</h2>
            <p className="text-gray-600">Sync calendars from Airbnb, Booking.com, and other platforms</p>
          </div>
          <Upload className="w-8 h-8 text-green-600" />
        </div>

        <form onSubmit={handleSubmit(addCalendarSync)} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                {...register('platform', { required: 'Platform is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select platform</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking.com">Booking.com</option>
                <option value="vrbo">VRBO</option>
              </select>
              {errors.platform && (
                <p className="text-red-500 text-sm mt-1">{errors.platform.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">iCal URL</label>
              <input
                type="url"
                {...register('icalUrl', { required: 'iCal URL is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://calendar.airbnb.com/calendar/..."
              />
              {errors.icalUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.icalUrl.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Calendar Sync</span>
          </button>
        </form>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">How to get iCal URLs:</h3>
          <div className="text-yellow-800 text-sm space-y-2">
            <p><strong>Airbnb:</strong> Host Dashboard → Calendar → Availability settings → Export calendar → Copy the iCal link</p>
            <p><strong>Booking.com:</strong> Extranet → Property → Calendar → Import/Export → Export calendar → Copy the iCal URL</p>
            <p><strong>VRBO:</strong> Owner Dashboard → Calendar → Export → Copy the iCal link</p>
          </div>
        </div>
      </div>

      {/* Synced Calendars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Synced Calendars</h2>
        
        {syncedCalendars.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No calendars synced yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {syncedCalendars.map((sync) => (
              <div key={sync.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${sync.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{sync.platform}</h3>
                    <p className="text-sm text-gray-600">
                      Last synced: {new Date(sync.lastSyncAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => syncCalendar(sync)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Sync Now</span>
                  </button>
                  
                  <a
                    href={sync.icalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => removeCalendarSync(sync.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sync Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mockBookings.length}</div>
            <div className="text-sm text-blue-800">Total Bookings</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{syncedCalendars.length}</div>
            <div className="text-sm text-green-800">Synced Calendars</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {syncedCalendars.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-purple-800">Active Syncs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSyncPage;