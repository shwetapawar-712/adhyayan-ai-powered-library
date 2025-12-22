import { AnalyticsData } from '@/types/library';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props {
  analytics: AnalyticsData[];
  peakHours: { hour: number; avgRate: number }[];
  noShowStats: { totalBookings: number; totalNoShows: number; noShowRate: number };
}

const AnalyticsDashboard = ({ analytics, peakHours, noShowStats }: Props) => {
  // Get last 7 days summary
  const dailyData = analytics.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { bookings: 0, noShows: 0, avgOccupancy: [] };
    }
    acc[curr.date].bookings += curr.bookings;
    acc[curr.date].noShows += curr.noShows;
    acc[curr.date].avgOccupancy.push(curr.occupancyRate);
    return acc;
  }, {} as Record<string, { bookings: number; noShows: number; avgOccupancy: number[] }>);

  const days = Object.entries(dailyData).slice(-7);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Analytics Dashboard</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <div className="p-4 rounded-xl bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-display text-sm font-bold">Peak Hours</h4>
          </div>
          <div className="space-y-2">
            {peakHours.map((ph, i) => (
              <div key={ph.hour} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {ph.hour}:00 - {ph.hour + 1}:00
                </span>
                <span className={`font-display font-bold ${
                  i === 0 ? 'text-destructive' : 'text-warning'
                }`}>
                  {ph.avgRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* No-Show Stats */}
        <div className="p-4 rounded-xl bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h4 className="font-display text-sm font-bold">No-Show Rate</h4>
          </div>
          <div className="text-center py-4">
            <div className="counter-value text-warning">{noShowStats.noShowRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {noShowStats.totalNoShows} of {noShowStats.totalBookings} bookings
            </p>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="p-4 rounded-xl bg-muted/20">
          <h4 className="font-display text-sm font-bold mb-3">7-Day Trend</h4>
          <div className="flex items-end justify-between h-20 gap-1">
            {days.map(([date, data]) => {
              const avg = Math.round(data.avgOccupancy.reduce((a, b) => a + b, 0) / data.avgOccupancy.length);
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/60 rounded-t"
                    style={{ height: `${avg}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
