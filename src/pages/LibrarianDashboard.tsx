import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSeats } from '@/hooks/useSeats';
import { useBooks } from '@/hooks/useBooks';
import { useAI } from '@/hooks/useAI';
import { LogOut, RotateCcw, Monitor, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvailabilityStats from '@/components/AvailabilityStats';
import SeatMap from '@/components/SeatMap';
import AIDetectionPanel from '@/components/AIDetectionPanel';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import BookManagement from '@/components/BookManagement';

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLibrarian, isLoading: authLoading, logout } = useAuth();
  const { seats, bookings, detectOccupancy, resetAllSeats, getStats, isLoading, setDemoMode, isDemoMode } = useSeats();
  const { books, addBook, updateBook, deleteBook, getBookStats } = useBooks();
  const { analytics, getPeakHours, getNoShowStats } = useAI();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isLibrarian)) {
      navigate('/auth?role=librarian');
    }
  }, [isAuthenticated, isLibrarian, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
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
            <h1 className="font-display text-xl font-bold glow-text-accent">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Librarian: {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDemoMode(!isDemoMode)}
              className={isDemoMode ? 'border-accent text-accent' : ''}
            >
              {isDemoMode ? <Monitor className="w-4 h-4 mr-2" /> : <Tv className="w-4 h-4 mr-2" />}
              {isDemoMode ? 'Demo Mode' : 'Full Mode'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetAllSeats}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <AvailabilityStats stats={stats} />

        <div className="grid lg:grid-cols-2 gap-6">
          <SeatMap seats={seats} bookings={bookings} isAdmin />
          <AIDetectionPanel onDetection={detectOccupancy} />
        </div>

        <BookManagement
          books={books}
          onAddBook={addBook}
          onUpdateBook={updateBook}
          onDeleteBook={deleteBook}
          stats={bookStats}
        />

        <AnalyticsDashboard 
          analytics={analytics} 
          peakHours={getPeakHours()} 
          noShowStats={getNoShowStats()} 
        />
      </main>
    </div>
  );
};

export default LibrarianDashboard;
