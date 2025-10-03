import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { db } from '../services/mockDatabase';
import { hashIrisData } from '../utils/crypto';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (irisHash: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      db.getUserById(savedUserId).then(user => {
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        }
      });
    }
  }, []);

  const login = async (irisPattern: string): Promise<boolean> => {
    const irisHash = await hashIrisData(irisPattern);
    const foundUser = await db.getUserByIrisHash(irisHash);

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('userId', foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
  };

  const refreshUser = async () => {
    if (user) {
      const updatedUser = await db.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
