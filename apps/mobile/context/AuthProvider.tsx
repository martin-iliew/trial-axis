import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setAccessToken, clearTokens } from '@shared/utils/tokenStorage';
import { configureApiClient } from '@shared/api/client';
import { mobileAuthApi } from '@shared/services/authService';
import type { User } from '@shared/api-types/auth';
import type { UserRole, Permission } from '@shared/constants/roles';
import { hasPermission } from '@shared/utils/permissions';
import { AuthContext } from './AuthContext';
import { MOBILE_API_BASE_URL } from '../config/api';

const REFRESH_TOKEN_KEY = 'auth_refresh_token';

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteStorageItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthFailure = useCallback(async () => {
    await deleteStorageItem(REFRESH_TOKEN_KEY);
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    configureApiClient({
      baseURL: MOBILE_API_BASE_URL,
      authMode: 'mobile',
      onAuthFailure: handleAuthFailure,
      getRefreshToken: () => getStorageItem(REFRESH_TOKEN_KEY),
      setRefreshToken: async (token) => {
        if (token) {
          await setStorageItem(REFRESH_TOKEN_KEY, token);
          return;
        }
        await deleteStorageItem(REFRESH_TOKEN_KEY);
      },
      clearRefreshToken: () => deleteStorageItem(REFRESH_TOKEN_KEY),
    });

    const restoreSession = async () => {
      try {
        const refreshToken = await getStorageItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const session = await mobileAuthApi.refresh(refreshToken);
          setAccessToken(session.accessToken);
          if ('refreshToken' in session) {
            await setStorageItem(REFRESH_TOKEN_KEY, session.refreshToken);
          }
          const loadedUser = await mobileAuthApi.getMe();
          if (!cancelled) {
            setUser(loadedUser);
          }
        }
      } catch (e) {
        console.error("Failed to restore mobile session.", e);
        await deleteStorageItem(REFRESH_TOKEN_KEY);
        clearTokens();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [handleAuthFailure]);

  const login = async (email: string, password: string) => {
    const session = await mobileAuthApi.login({ email, password });
    setAccessToken(session.accessToken);
    if ('refreshToken' in session) {
      await setStorageItem(REFRESH_TOKEN_KEY, session.refreshToken);
    }
    const currentUser = await mobileAuthApi.getMe();
    setUser(currentUser);
  };

  const register = async (email: string, password: string) => {
    await mobileAuthApi.register({ email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      const refreshToken = await getStorageItem(REFRESH_TOKEN_KEY);
      await mobileAuthApi.logout(refreshToken ?? undefined);
    } finally {
      await deleteStorageItem(REFRESH_TOKEN_KEY);
      clearTokens();
      setUser(null);
    }
  };

  const userRole = (user?.role as UserRole) ?? ('Customer' as UserRole);
  const hasRoleFn = (role: UserRole) => user?.role === role;
  const isAdmin = () => hasRoleFn('Admin' as UserRole);
  const canDo = (permission: Permission) => hasPermission(userRole, permission);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, logout, hasRole: hasRoleFn, isAdmin, canDo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
