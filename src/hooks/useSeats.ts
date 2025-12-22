import { useState, useEffect, useCallback } from 'react';
import { Seat, Booking, SeatStatus, LibraryStats } from '@/types/library';

const SEATS_STORAGE_KEY = 'library_seats';
const BOOKINGS_STORAGE_KEY = 'library_bookings';
const DEMO_MODE_KEY = 'library_demo_mode';

// Demo seats matching MediaPipe detection zones (4 seats)
const initializeDemoSeats = (): Seat[] => [
  { id: 'A1', zone: 'A', number: 1, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'A2', zone: 'A', number: 2, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'B1', zone: 'B', number: 1, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'B2', zone: 'B', number: 2, status: 'available', lastUpdated: new Date().toISOString() },
];

// Initialize 24 seats across 2 zones (full mode)
const initializeFullSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const zones: ('A' | 'B')[] = ['A', 'B'];
  
  zones.forEach(zone => {
    for (let i = 1; i <= 12; i++) {
      seats.push({
        id: `${zone}${i.toString().padStart(2, '0')}`,
        zone,
        number: i,
        status: 'available',
        lastUpdated: new Date().toISOString(),
      });
    }
  });
  
  return seats;
};

// Default to demo mode for easier testing
const initializeSeats = (): Seat[] => {
  const isDemoMode = localStorage.getItem(DEMO_MODE_KEY) !== 'false';
  return isDemoMode ? initializeDemoSeats() : initializeFullSeats();
};

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const storedSeats = localStorage.getItem(SEATS_STORAGE_KEY);
    const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);

    if (storedSeats) {
      try {
        setSeats(JSON.parse(storedSeats));
      } catch {
        setSeats(initializeSeats());
      }
    } else {
      setSeats(initializeSeats());
    }

    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch {
        setBookings([]);
      }
    }

    setIsLoading(false);
  }, []);

  // Save to localStorage whenever seats/bookings change
  useEffect(() => {
    if (!isLoading && seats.length > 0) {
      localStorage.setItem(SEATS_STORAGE_KEY, JSON.stringify(seats));
    }
  }, [seats, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings, isLoading]);

  // Check for expired frozen bookings every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setSeats(prevSeats => 
        prevSeats.map(seat => {
          if (seat.status === 'frozen' && seat.frozenUntil) {
            const frozenUntil = new Date(seat.frozenUntil);
            if (now >= frozenUntil) {
              // No-show: release the seat
              return {
                ...seat,
                status: 'available' as SeatStatus,
                reservedBy: undefined,
                reservedAt: undefined,
                frozenUntil: undefined,
                lastUpdated: now.toISOString(),
              };
            }
          }
          return seat;
        })
      );

      // Mark expired bookings as no-show
      setBookings(prevBookings =>
        prevBookings.map(booking => {
          if (booking.status === 'active' && booking.frozenUntil) {
            const frozenUntil = new Date(booking.frozenUntil);
            if (now >= frozenUntil && !booking.arrivedAt) {
              return { ...booking, status: 'no-show' };
            }
          }
          return booking;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const bookSeat = useCallback((seatId: string, userId: string, userName: string, duration: number) => {
    const now = new Date();
    const frozenUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    const booking: Booking = {
      id: `booking_${Date.now()}`,
      seatId,
      userId,
      userName,
      startTime: now.toISOString(),
      duration,
      status: 'active',
      frozenUntil: frozenUntil.toISOString(),
      createdAt: now.toISOString(),
    };

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? {
              ...seat,
              status: 'frozen' as SeatStatus,
              reservedBy: userId,
              reservedAt: now.toISOString(),
              reservationDuration: duration,
              frozenUntil: frozenUntil.toISOString(),
              lastUpdated: now.toISOString(),
            }
          : seat
      )
    );

    setBookings(prev => [...prev, booking]);
    return booking;
  }, []);

  const confirmArrival = useCallback((seatId: string) => {
    const now = new Date();

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? {
              ...seat,
              status: 'occupied' as SeatStatus,
              frozenUntil: undefined,
              lastUpdated: now.toISOString(),
            }
          : seat
      )
    );

    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.seatId === seatId && booking.status === 'active'
          ? { ...booking, arrivedAt: now.toISOString() }
          : booking
      )
    );
  }, []);

  const releaseSeat = useCallback((seatId: string) => {
    const now = new Date();

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? {
              ...seat,
              status: 'available' as SeatStatus,
              occupiedBy: undefined,
              reservedBy: undefined,
              reservedAt: undefined,
              frozenUntil: undefined,
              lastUpdated: now.toISOString(),
            }
          : seat
      )
    );

    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.seatId === seatId && booking.status === 'active'
          ? { ...booking, status: 'completed' }
          : booking
      )
    );
  }, []);

  const updateSeatStatus = useCallback((seatId: string, status: SeatStatus) => {
    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? { ...seat, status, lastUpdated: new Date().toISOString() }
          : seat
      )
    );
  }, []);

  const detectOccupancy = useCallback((seatId: string, isOccupied: boolean) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id !== seatId) return seat;

        if (isOccupied) {
          // Person detected
          if (seat.status === 'frozen') {
            // Confirm arrival for frozen seat
            return {
              ...seat,
              status: 'occupied' as SeatStatus,
              frozenUntil: undefined,
              lastUpdated: new Date().toISOString(),
            };
          }
          return {
            ...seat,
            status: 'occupied' as SeatStatus,
            lastUpdated: new Date().toISOString(),
          };
        } else {
          // No person detected
          if (seat.status === 'occupied') {
            return {
              ...seat,
              status: 'available' as SeatStatus,
              occupiedBy: undefined,
              lastUpdated: new Date().toISOString(),
            };
          }
        }
        return seat;
      })
    );

    // Also update booking if arrival is confirmed
    if (isOccupied) {
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.seatId === seatId && booking.status === 'active' && !booking.arrivedAt
            ? { ...booking, arrivedAt: new Date().toISOString() }
            : booking
        )
      );
    }
  }, []);

  const getStats = useCallback((): LibraryStats => {
    const available = seats.filter(s => s.status === 'available').length;
    const reserved = seats.filter(s => s.status === 'reserved').length;
    const occupied = seats.filter(s => s.status === 'occupied').length;
    const frozen = seats.filter(s => s.status === 'frozen').length;
    const total = seats.length;

    // Mock peak hour calculation
    const currentHour = new Date().getHours();
    const peakHour = currentHour >= 14 && currentHour <= 18 ? '2PM - 6PM' : '10AM - 2PM';

    return {
      totalSeats: total,
      availableSeats: available,
      reservedSeats: reserved,
      occupiedSeats: occupied,
      frozenSeats: frozen,
      occupancyPercentage: total > 0 ? Math.round(((occupied + frozen + reserved) / total) * 100) : 0,
      peakHour,
      currentHour,
    };
  }, [seats]);

  const getSeatById = useCallback((seatId: string) => {
    return seats.find(s => s.id === seatId);
  }, [seats]);

  const getBookingBySeatId = useCallback((seatId: string) => {
    return bookings.find(b => b.seatId === seatId && b.status === 'active');
  }, [bookings]);

  const resetAllSeats = useCallback(() => {
    setSeats(initializeSeats());
    setBookings([]);
  }, []);

  const setDemoMode = useCallback((enabled: boolean) => {
    localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
    setSeats(enabled ? initializeDemoSeats() : initializeFullSeats());
    setBookings([]);
  }, []);

  const isDemoMode = seats.length === 4;

  return {
    seats,
    bookings,
    isLoading,
    bookSeat,
    confirmArrival,
    releaseSeat,
    updateSeatStatus,
    detectOccupancy,
    getStats,
    getSeatById,
    getBookingBySeatId,
    resetAllSeats,
    setDemoMode,
    isDemoMode,
  };
};
