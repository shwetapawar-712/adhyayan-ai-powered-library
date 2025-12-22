import { useState } from 'react';
import { Seat, Booking } from '@/types/library';
import { Clock, Snowflake, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  seats: Seat[];
  bookings: Booking[];
  onBookSeat?: (seatId: string, duration: number) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const SeatMap = ({ seats, bookings, onBookSeat, currentUserId, isAdmin }: Props) => {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showModal, setShowModal] = useState(false);

  const zoneA = seats.filter(s => s.zone === 'A');
  const zoneB = seats.filter(s => s.zone === 'B');

  const getSeatClass = (seat: Seat) => {
    const base = 'relative w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer';
    switch (seat.status) {
      case 'available': return `${base} seat-available`;
      case 'reserved': return `${base} seat-reserved`;
      case 'occupied': return `${base} seat-occupied`;
      case 'frozen': return `${base} seat-frozen`;
      default: return base;
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available' && !isAdmin) {
      setSelectedSeat(seat);
      setShowModal(true);
    }
  };

  const handleBook = (duration: number) => {
    if (selectedSeat && onBookSeat) {
      onBookSeat(selectedSeat.id, duration);
      setShowModal(false);
      setSelectedSeat(null);
    }
  };

  const getFrozenTimeLeft = (seat: Seat) => {
    if (!seat.frozenUntil) return null;
    const remaining = Math.max(0, Math.floor((new Date(seat.frozenUntil).getTime() - Date.now()) / 60000));
    return remaining;
  };

  const renderSeat = (seat: Seat) => {
    const timeLeft = getFrozenTimeLeft(seat);
    
    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        className={getSeatClass(seat)}
        disabled={seat.status !== 'available' && !isAdmin}
      >
        {seat.status === 'frozen' && (
          <Snowflake className="w-4 h-4 animate-pulse" />
        )}
        {seat.status === 'occupied' && (
          <User className="w-4 h-4" />
        )}
        <span className="font-display text-xs font-bold">{seat.id}</span>
        {seat.status === 'frozen' && timeLeft !== null && (
          <span className="text-[10px] flex items-center gap-0.5">
            <Clock className="w-2 h-2" />
            {timeLeft}m
          </span>
        )}
      </button>
    );
  };

  const isDemoMode = seats.length <= 4;

  return (
    <>
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold">Seat Map</h2>
            {isDemoMode && (
              <span className="text-xs text-accent">Demo Mode (4 seats)</span>
            )}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-success/50" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-frozen/50" /> Frozen</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/50" /> Occupied</span>
          </div>
        </div>

        {isDemoMode ? (
          /* Demo mode - large 2x2 grid */
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="font-display text-sm font-bold mb-4 text-center text-primary">Zone A</h3>
              <div className="grid grid-cols-2 gap-4">
                {zoneA.map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`${getSeatClass(seat)} min-h-[120px] text-lg`}
                    disabled={seat.status !== 'available' && !isAdmin}
                  >
                    {seat.status === 'frozen' && <Snowflake className="w-8 h-8 animate-pulse" />}
                    {seat.status === 'occupied' && <User className="w-8 h-8" />}
                    <span className="font-display text-xl font-bold">{seat.id}</span>
                    {seat.status === 'frozen' && getFrozenTimeLeft(seat) !== null && (
                      <span className="text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getFrozenTimeLeft(seat)}m
                      </span>
                    )}
                    <span className="text-xs uppercase opacity-70">{seat.status}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="font-display text-sm font-bold mb-4 text-center text-accent">Zone B</h3>
              <div className="grid grid-cols-2 gap-4">
                {zoneB.map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`${getSeatClass(seat)} min-h-[120px] text-lg`}
                    disabled={seat.status !== 'available' && !isAdmin}
                  >
                    {seat.status === 'frozen' && <Snowflake className="w-8 h-8 animate-pulse" />}
                    {seat.status === 'occupied' && <User className="w-8 h-8" />}
                    <span className="font-display text-xl font-bold">{seat.id}</span>
                    {seat.status === 'frozen' && getFrozenTimeLeft(seat) !== null && (
                      <span className="text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getFrozenTimeLeft(seat)}m
                      </span>
                    )}
                    <span className="text-xs uppercase opacity-70">{seat.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Full mode - original 4x3 grid per zone */
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="font-display text-sm font-bold mb-4 text-center text-primary">Zone A</h3>
              <div className="grid grid-cols-4 gap-2">
                {zoneA.map(renderSeat)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h3 className="font-display text-sm font-bold mb-4 text-center text-accent">Zone B</h3>
              <div className="grid grid-cols-4 gap-2">
                {zoneB.map(renderSeat)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-display">Book Seat {selectedSeat?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Select booking duration:</p>
            <div className="grid grid-cols-3 gap-3">
              {[30, 60, 120].map((mins) => (
                <Button
                  key={mins}
                  variant="outline"
                  onClick={() => handleBook(mins)}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Seat will be frozen for 15 minutes. Arrive on time or booking is cancelled.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SeatMap;
