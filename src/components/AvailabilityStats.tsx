import { LibraryStats } from '@/types/library';
import { Users, CheckCircle, Clock, Snowflake, TrendingUp } from 'lucide-react';

interface Props {
  stats: LibraryStats;
}

const AvailabilityStats = ({ stats }: Props) => {
  const statCards = [
    { label: 'Total Seats', value: stats.totalSeats, icon: Users, color: 'text-foreground' },
    { label: 'Available', value: stats.availableSeats, icon: CheckCircle, color: 'text-success' },
    { label: 'Occupied', value: stats.occupiedSeats, icon: Users, color: 'text-destructive' },
    { label: 'Frozen', value: stats.frozenSeats, icon: Snowflake, color: 'text-frozen' },
  ];

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold">Live Availability</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-success rounded-full pulse-live" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className={`counter-value ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Occupancy</span>
          <span className="font-display font-bold text-primary">{stats.occupancyPercentage}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full progress-glow transition-all duration-500"
            style={{ width: `${stats.occupancyPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
          <TrendingUp className="w-3 h-3" />
          Peak hours: {stats.peakHour}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityStats;
