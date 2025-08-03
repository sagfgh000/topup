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
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
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

  const handleAuthError = (error: any, context: 'Login' | 'Signup' | 'Google Login' | 'Password Reset') => {
    let description = 'An unexpected error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/invalid-credential':
        description = 'Invalid credentials. Please check your email and password.';
        break;
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        description = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        description = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        description = 'This email is already registered. Please login instead.';
        break;
      case 'auth/weak-password':
        description = 'The password is too weak. Please use at least 6 characters.';
        break;
       case 'auth/popup-closed-by-user':
        description = 'The process was cancelled.';
        break;
      default:
        // For other errors, you might want a generic message or to log them
        console.error(`Unhandled auth error in ${context}:`, error);
        description = `An unexpected error occurred: ${error.code}`;
        break;
    }

    toast({
      variant: 'destructive',
      title: `${context} Failed`,
      description: description,
    });
  }

  const login = async (email: string, pass: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      handleAuthError(error, 'Login');
      throw error;
    }
  };
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
       handleAuthError(error, 'Google Login');
       throw error;
    }
  }

  const signup = async (email: string, pass: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error: any)
{
      handleAuthError(error, 'Signup');
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
  
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      handleAuthError(error, 'Password Reset');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    sendPasswordReset,
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
