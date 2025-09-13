import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('pharmacare_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('pharmacare_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login - in real app, this would be an API call
      if (email === 'admin@pharmacare.com' && password === 'admin123') {
        const userData = {
          id: '1',
          name: 'Admin User',
          email: 'admin@pharmacare.com',
          role: 'admin',
          active: true,
          lastLogin: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('pharmacare_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - in real app, this would be an API call
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'staff',
        active: true,
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('pharmacare_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pharmacare_user');
    localStorage.removeItem('pharmacare_notifications');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('pharmacare_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};