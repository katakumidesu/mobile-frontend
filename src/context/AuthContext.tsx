import React, { createContext, useContext, ReactNode } from 'react';
import type { AuthUser } from '../api/auth';

type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  user,
  setUser,
}: {
  children: ReactNode;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}) {
  return (
    <AuthContext.Provider value={{ user, setUser }}>
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
