'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
    useUser as useFirebaseUser, 
    initiateEmailSignIn,
    initiateEmailSignUp,
    useAuth as useFirebaseAuth,
} from '@/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

type User = {
  uid: string;
  name: string | null;
  email: string | null;
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

// A helper function to map Firebase user to our app's user type
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    name: firebaseUser.displayName,
    email: firebaseUser.email,
});


export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useFirebaseUser();
  const auth = useFirebaseAuth();

  const user = firebaseUser ? mapFirebaseUser(firebaseUser) : null;

  const login = async (email: string, pass: string): Promise<void> => {
    try {
        await initiateEmailSignIn(auth, email, pass);
    } catch (error) {
        console.error("Login error", error);
        if (error instanceof Error) {
            // Firebase often throws errors with a user-friendly message.
            if (error.message.includes('auth/invalid-credential')) {
                throw new Error('Invalid email or password. Please try again.');
            }
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during login.");
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    try {
        const userCredential = await initiateEmailSignUp(auth, email, pass);
        // After user is created, update their profile with the name
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
        }
    } catch (error) {
        console.error("Registration error", error);
        if (error instanceof Error) {
            if (error.message.includes('auth/email-already-in-use')) {
                throw new Error('This email address is already in use. Please try another.');
            }
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during registration.");
    }
  };

  const logout = () => {
    if(auth) {
        signOut(auth);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isUserLoading,
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
