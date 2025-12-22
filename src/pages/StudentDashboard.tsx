import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSeats } from '@/hooks/useSeats';
import { useBooks } from '@/hooks/useBooks';
import { useAI } from '@/hooks/useAI';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AvailabilityStats from '@/components/AvailabilityStats';
import SeatMap from '@/components/SeatMap';
import ChatBot from '@/components/ChatBot';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import BookList from '@/components/BookList';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const { seats, bookings, bookSeat, getStats, isLoading } = useSeats();
 const { books, getBookStats, isLoading: booksLoading } = useBooks();
 const { recommendations, generateRecommendations } = useAI();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?role=student');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const stats = getStats();
    generateRecommendations(stats.occupancyPercentage);
  }, [seats, getStats, generateRecommendations]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading || authLoading || booksLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}


  const stats = getStats();
  const bookStats = getBookStats();

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-gradient">Smart Library</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <AvailabilityStats stats={stats} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <SeatMap 
              seats={seats} 
              bookings={bookings}
              onBookSeat={(seatId, duration) => {
                if (user) {
                  bookSeat(seatId, user.id, user.name, duration);
                  toast({
                    title: 'Seat Booked!',
                    description: `Seat ${seatId} reserved for ${duration} minutes. Arrive within 15 minutes.`,
                  });
                }
              }}
              currentUserId={user?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecommendationsPanel recommendations={recommendations} />
            <BookList books={books} stats={bookStats} />
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatBot />
    </div>
  );
};

export default StudentDashboard;
