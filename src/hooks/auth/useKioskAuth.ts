import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { KioskLoginRequest, KioskEndShiftResponse } from '../../types/auth/kiosk.types';

interface UseKioskAuthReturn {
  login: (data: KioskLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  endShift: () => Promise<KioskEndShiftResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  rateLimitMessage: string | null;
  lockedMessage: string | null;
}

export const useKioskAuth = (): UseKioskAuthReturn => {
  const { kioskLogin, logout: authLogout, endShift: authEndShift } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRateLimitMessage(null);
    setLockedMessage(null);
  }, []);

  const login = useCallback(async (data: KioskLoginRequest) => {
    setIsLoading(true);
    clearError();

    try {
      await kioskLogin(data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };

      if (error.response?.status === 429) {
        setRateLimitMessage('Too many login attempts. Please try again later.');
      } else if (error.response?.status === 423) {
        setLockedMessage('Account locked. Contact your manager.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Invalid User ID or PIN. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [kioskLogin, clearError]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authLogout();
    } catch (err) {
      console.error('Kiosk logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authLogout]);

  const endShift = useCallback(async (): Promise<KioskEndShiftResponse | null> => {
    setIsLoading(true);
    try {
      const result = await authEndShift();
      return result || null;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to end shift');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authEndShift]);

  return {
    login,
    logout,
    endShift,
    isLoading,
    error,
    clearError,
    rateLimitMessage,
    lockedMessage,
  };
};

export default useKioskAuth;
