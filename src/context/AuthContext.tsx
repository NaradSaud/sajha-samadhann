
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'agent';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    avatar: '',
  },
  {
    id: '2',
    name: 'Agent Smith',
    email: 'agent@bhimdatta.gov.np',
    role: 'agent',
    avatar: '',
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('bhimdatta-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Handle potential JSON parsing errors
        console.error("Error parsing saved user:", error);
        localStorage.removeItem('bhimdatta-user');
      }
    }
    setLoading(false);
  }, []);

  // Registration function
  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
      };
      
      // Save user to local storage (in real app, this would be JWT token)
      localStorage.setItem('bhimdatta-user', JSON.stringify(newUser));
      setUser(newUser);
      toast({
        title: 'Account created',
        description: 'You have successfully registered'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user
      const foundUser = mockUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Save user to local storage (in real app, this would be JWT token)
      localStorage.setItem('bhimdatta-user', JSON.stringify(foundUser));
      setUser(foundUser);
      toast({
        title: 'Welcome back',
        description: `Logged in as ${foundUser.name}`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('bhimdatta-user');
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully'
    });
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const foundUser = mockUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      toast({
        title: 'Password reset link sent',
        description: 'Check your email for instructions'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset password failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('bhimdatta-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password change failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.removeItem('bhimdatta-user');
      setUser(null);
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Account deletion failed',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      resetPassword,
      updateProfile,
      changePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
