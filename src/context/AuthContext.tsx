import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lms_auth') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lms_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, id: parsed._id || parsed.id };
    }
    return null;
  });

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.user) {
        const userWithId = { ...data.user, id: data.user._id || data.user.id };
        setIsAuthenticated(true);
        setCurrentUser(userWithId);
        localStorage.setItem('lms_auth', 'true');
        localStorage.setItem('lms_user', JSON.stringify(userWithId));
        return { success: true, user: userWithId };
      }
      return { success: false };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('lms_auth');
    localStorage.removeItem('lms_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
