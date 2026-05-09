import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('iron_ledger_token');
    const storedUsername = localStorage.getItem('iron_ledger_username');
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({ username: storedUsername });
    }
  }, []);

  const login = (newToken: string, username: string) => {
    localStorage.setItem('iron_ledger_token', newToken);
    localStorage.setItem('iron_ledger_username', username);
    setToken(newToken);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('iron_ledger_token');
    localStorage.removeItem('iron_ledger_username');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
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
