import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/lib/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiClient.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    setUser(data.user);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
  };

  return { user, isAuthenticated, isLoading, login, logout };
};