import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/library';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'student';
  const { login } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, role);
      toast({
        title: 'Welcome!',
        description: `Logged in as ${role}`,
      });
      navigate(role === 'librarian' ? '/librarian' : '/student');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: role === 'librarian' ? 'admin@library.edu' : 'student@university.edu',
      password: 'demo123',
    });
  };

  return (
    <div className="min-h-screen bg-background grid-pattern relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to role selection
        </Button>

        {/* Auth Card */}
        <div className="glass-card p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              role === 'librarian' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
            }`}>
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              {role === 'librarian' ? 'Librarian Login' : 'Student Login'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full font-display ${
                role === 'librarian' 
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
            >
              Use Demo Credentials
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Demo mode: Any valid email and password (4+ chars) will work
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 glass-card">
          <p className="text-xs text-center text-muted-foreground">
            🔒 <strong>Privacy Notice:</strong> This system does not store any personal images or videos. 
            All AI detection is performed locally and frames are discarded immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
