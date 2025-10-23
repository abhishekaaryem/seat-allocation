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
        initiateEmailSignIn(auth, email, pass);
    } catch (error) {
        console.error("Login error", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during login.");
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    try {
        // We can't use the non-blocking version here easily because we need the user credential to update the profile.
        await initiateEmailSignUp(auth, email, pass);
        
        // This part runs after the user is created and signed in.
        // A listener for onAuthStateChanged will eventually catch the new user state.
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                unsubscribe(); // Stop listening to prevent multiple updates
                try {
                    await updateProfile(user, { displayName: name });
                } catch (profileError) {
                    console.error("Error updating profile:", profileError);
                    // Decide how to handle this - maybe the user has to set their name later.
                }
            }
        });
        
    } catch (error) {
        console.error("Registration error", error);
        if (error instanceof Error) {
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
