'use client';

import React,
{
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
      throw error;
    }
  };

  const signup = async (email: string, pass: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
      throw error;
    }
  };


  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
