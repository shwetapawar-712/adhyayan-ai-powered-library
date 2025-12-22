export type UserRole = 'student' | 'librarian';

export type SeatStatus = 'available' | 'reserved' | 'occupied' | 'frozen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Seat {
  id: string;
  zone: 'A' | 'B';
  number: number;
  status: SeatStatus;
  occupiedBy?: string;
  reservedBy?: string;
  reservedAt?: string;
  reservationDuration?: number; // in minutes
  frozenUntil?: string;
  lastUpdated: string;
}

export interface Booking {
  id: string;
  seatId: string;
  userId: string;
  userName: string;
  startTime: string;
  duration: number; // in minutes
  status: 'active' | 'completed' | 'cancelled' | 'no-show';
  frozenUntil?: string;
  arrivedAt?: string;
  createdAt: string;
}

export interface LibraryStats {
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  occupiedSeats: number;
  frozenSeats: number;
  occupancyPercentage: number;
  peakHour: string;
  currentHour: number;
}

export interface AnalyticsData {
  date: string;
  hour: number;
  occupancyRate: number;
  bookings: number;
  noShows: number;
}

export interface AIRecommendation {
  id: string;
  type: 'time' | 'seat' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DetectionZone {
  id: string;
  seatId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  seatId: string;
  detected: boolean;
  confidence: number;
  timestamp: string;
}

export type BookStatus = 'available' | 'borrowed' | 'reserved';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  addedAt: string;
  updatedAt: string;
}
