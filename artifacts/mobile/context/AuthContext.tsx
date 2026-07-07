import React, { createContext, useContext, useState } from 'react';
import { Member } from '@/types';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentMember: Member | null;
  login: (memberId: string, password: string, members: Member[]) => boolean;
  adminLogin: (username: string, password: string) => boolean;
  logout: () => void;
  updateCurrentMember: (m: Partial<Member>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  currentMember: null,
  login: () => false,
  adminLogin: () => false,
  logout: () => {},
  updateCurrentMember: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const login = (memberId: string, password: string, members: Member[]): boolean => {
    const member = members.find(
      m => m.memberId === memberId && m.password === password && m.status === 'active'
    );
    if (member) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setCurrentMember(member);
      return true;
    }
    return false;
  };

  const adminLogin = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setCurrentMember(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentMember(null);
  };

  const updateCurrentMember = (m: Partial<Member>) => {
    setCurrentMember(prev => (prev ? { ...prev, ...m } : null));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, currentMember, login, adminLogin, logout, updateCurrentMember }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
