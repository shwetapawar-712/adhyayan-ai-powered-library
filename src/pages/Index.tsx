import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Library, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/library';

const Index = () => {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Seat Management</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-gradient">Adhyayan</span>
          </h1>
          <h2 className="font-display text-2xl md:text-3xl text-foreground/80 mb-4">
            AI-Powered Library Seat Tracker
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            Find, book, and use library seats with real-time AI detection and intelligent recommendations.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mb-12">
          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            onMouseEnter={() => setHoveredRole('student')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`glass-card-hover p-8 text-left group transition-all duration-500 ${
              hoveredRole === 'student' ? 'border-primary scale-[1.02]' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-xl transition-all duration-300 ${
                hoveredRole === 'student' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary'
              }`}>
                <GraduationCap className="w-8 h-8" />
              </div>
              <ArrowRight className={`w-6 h-6 text-primary transition-all duration-300 ${
                hoveredRole === 'student' ? 'translate-x-1 opacity-100' : 'opacity-0'
              }`} />
            </div>
            
            <h3 className="font-display text-2xl font-bold mb-2">Student</h3>
            <p className="text-muted-foreground mb-4">
              Browse available seats, make reservations, and get AI-powered study spot recommendations.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                View Availability
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                Book Seats
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                AI Chat
              </span>
            </div>
          </button>

          {/* Librarian Card */}
          <button
            onClick={() => handleRoleSelect('librarian')}
            onMouseEnter={() => setHoveredRole('librarian')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`glass-card-hover p-8 text-left group transition-all duration-500 ${
              hoveredRole === 'librarian' ? 'border-accent scale-[1.02]' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-xl transition-all duration-300 ${
                hoveredRole === 'librarian' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-accent/10 text-accent'
              }`}>
                <Library className="w-8 h-8" />
              </div>
              <ArrowRight className={`w-6 h-6 text-accent transition-all duration-300 ${
                hoveredRole === 'librarian' ? 'translate-x-1 opacity-100' : 'opacity-0'
              }`} />
            </div>
            
            <h3 className="font-display text-2xl font-bold mb-2">Librarian</h3>
            <p className="text-muted-foreground mb-4">
              Access AI detection panel, manage seats, view analytics, and monitor library operations.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent">
                AI Detection
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent">
                Analytics
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent">
                Admin Tools
              </span>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl w-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 text-success mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-sm">Real-time Updates</h4>
            <p className="text-xs text-muted-foreground">Live seat availability</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-sm">AI Detection</h4>
            <p className="text-xs text-muted-foreground">AI Recommendations</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-sm">Privacy-Safe</h4>
            <p className="text-xs text-muted-foreground">No data stored</p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">
         Real-time Seat Monitoring • AI Recommendations • Digital Book Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
