import { useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services/auth/authService';

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

interface UseRefreshTokenOptions {
  refreshBeforeExpiry?: number; // milliseconds before expiry to refresh (default: 5 minutes)
  checkInterval?: number; // milliseconds between checks (default: 1 minute)
  onRefreshError?: (error: unknown) => void;
  onRefreshSuccess?: () => void;
}

export const useRefreshToken = (options: UseRefreshTokenOptions = {}) => {
  const {
    refreshBeforeExpiry = 5 * 60 * 1000, // 5 minutes
    checkInterval = 60 * 1000, // 1 minute
    onRefreshError,
    onRefreshSuccess,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);

  const getTokenExpiry = useCallback((): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }, []);

  const shouldRefresh = useCallback((): boolean => {
    const expiry = getTokenExpiry();
    if (!expiry) return false;

    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    // Refresh if within the threshold
    return timeUntilExpiry > 0 && timeUntilExpiry <= refreshBeforeExpiry;
  }, [getTokenExpiry, refreshBeforeExpiry]);

  const isTokenExpired = useCallback((): boolean => {
    const expiry = getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry;
  }, [getTokenExpiry]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing.current) return false;

    isRefreshing.current = true;
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('token', response.token);
      onRefreshSuccess?.();
      return true;
    } catch (error) {
      onRefreshError?.(error);
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [onRefreshError, onRefreshSuccess]);

  const checkAndRefresh = useCallback(async () => {
    if (shouldRefresh()) {
      await refreshToken();
    }
  }, [shouldRefresh, refreshToken]);

  // Set up periodic token check
  useEffect(() => {
    // Initial check
    checkAndRefresh();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkAndRefresh, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAndRefresh, checkInterval]);

  // Force refresh function for manual use
  const forceRefresh = useCallback(async (): Promise<boolean> => {
    return refreshToken();
  }, [refreshToken]);

  return {
    refreshToken: forceRefresh,
    isTokenExpired,
    shouldRefresh,
    getTokenExpiry,
  };
};

export default useRefreshToken;
