import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types/library';

const STORAGE_KEY = 'library_auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLibrarian: boolean;
  isStudent: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string, role: UserRole): Promise<User> => {
    return new Promise((resolve, reject) => {
      // Demo mode: simple validation
      if (!email.includes('@') || password.length < 4) {
        reject(new Error('Invalid credentials'));
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'User',
        email,
        role,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      resolve(newUser);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isLibrarian = user?.role === 'librarian';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      isLibrarian,
      isStudent,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
