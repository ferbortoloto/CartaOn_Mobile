import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('instrutorgo_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (password !== 'admin') {
          reject(new Error('Senha incorreta'));
          return;
        }

        let mockUser;
        if (email === 'instrutor@gmail.com') {
          mockUser = {
            id: 'instructor_1',
            name: 'Carlos Silva',
            email,
            role: 'instructor',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            phone: '(11) 98765-4321',
            licenseCategory: 'B',
            carModel: 'Honda Civic 2023',
            pricePerHour: 85,
            rating: 4.9,
            reviewsCount: 127,
            isVerified: true,
          };
        } else if (email === 'user@gmail.com') {
          mockUser = {
            id: 'user_1',
            name: 'João Silva',
            email,
            role: 'user',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          };
        } else {
          reject(new Error('Usuário não encontrado'));
          return;
        }

        try {
          await AsyncStorage.setItem('instrutorgo_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
          resolve({ success: true, user: mockUser });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('instrutorgo_user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
