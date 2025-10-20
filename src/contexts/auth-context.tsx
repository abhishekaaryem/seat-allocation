'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// This is a mock user type. In a real app, this would be more complex.
type User = {
  name: string;
  email: string;
};

// This is a mock database of users. In a real app, you'd use a proper database.
const mockUsers: { [email: string]: { name: string; passwordHash: string } } = {
    'admin@seatingsage.com': {
        name: 'Admin',
        passwordHash: 'password123' // In a real app, this would be a securely hashed password
    }
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might validate a token from localStorage here
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        // If JSON parsing fails, just ignore it.
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const storedUser = mockUsers[email];
            if (storedUser && storedUser.passwordHash === pass) {
                const loggedInUser: User = { name: storedUser.name, email };
                setUser(loggedInUser);
                localStorage.setItem('user', JSON.stringify(loggedInUser));
                resolve();
            } else {
                reject(new Error('Invalid email or password.'));
            }
        }, 500);
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            if (mockUsers[email]) {
                return reject(new Error('User with this email already exists.'));
            }
            mockUsers[email] = { name, passwordHash: pass };
            const newUser: User = { name, email };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            resolve();
        }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // In a real app, you'd also redirect to the login page.
    // This is handled in the AuthGuard component.
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
