import ical from 'ical-generator';
import { Booking } from '../types';

export const generateICalendar = (bookings: Booking[], propertyName: string): string => {
  const calendar = ical({
    domain: 'mountainretreat.com',
    name: `${propertyName} - Bookings`,
    description: `Booking calendar for ${propertyName}`,
    timezone: 'Africa/Johannesburg'
  });

  bookings.forEach(booking => {
    if (booking.status !== 'cancelled') {
      calendar.createEvent({
        start: new Date(booking.checkIn),
        end: new Date(booking.checkOut),
        summary: `Booking - ${booking.guestName}`,
        description: `Guest: ${booking.guestName}\nEmail: ${booking.guestEmail}\nPhone: ${booking.guestPhone}\nGuests: ${booking.guests}\nStatus: ${booking.status}`,
        location: propertyName,
        uid: `booking-${booking.id}@mountainretreat.com`
      });
    }
  });

  return calendar.toString();
};

export const parseICalendar = async (icalUrl: string): Promise<Date[]> => {
  try {
    const response = await fetch(icalUrl);
    const icalData = await response.text();
    
    // Parse iCal data and extract blocked dates
    const blockedDates: Date[] = [];
    
    // This is a simplified parser - in production, use a proper iCal parsing library
    const lines = icalData.split('\n');
    let currentEvent: any = {};
    
    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.start = new Date(dateStr);
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.end = new Date(dateStr);
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent.start && currentEvent.end) {
          // Add all dates between start and end
          const current = new Date(currentEvent.start);
          while (current < currentEvent.end) {
            blockedDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        }
      }
    }
    
    return blockedDates;
  } catch (error) {
    console.error('Error parsing iCal:', error);
    return [];
  }
};