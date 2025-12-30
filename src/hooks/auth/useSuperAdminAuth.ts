import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { SuperAdminLoginRequest } from '../../types/auth/superadmin.types';

interface UseSuperAdminAuthReturn {
  login: (data: SuperAdminLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  rateLimitMessage: string | null;
  requiresMfa: boolean;
  setRequiresMfa: (value: boolean) => void;
}

export const useSuperAdminAuth = (): UseSuperAdminAuthReturn => {
  const { superAdminLogin, logout: authLogout, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [requiresMfa, setRequiresMfa] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setRateLimitMessage(null);
  }, []);

  const login = useCallback(async (data: SuperAdminLoginRequest) => {
    setIsLoading(true);
    clearError();

    try {
      await superAdminLogin(data);

      // Check if password change is required
      if (mustChangePassword) {
        navigate('/superadmin/change-password');
      } else {
        navigate('/superadmin/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string; requires_mfa?: boolean } } };

      if (error.response?.status === 429) {
        const retryAfter = 15; // minutes
        setRateLimitMessage(`Too many login attempts. Please try again in ${retryAfter} minutes.`);
      } else if (error.response?.data?.requires_mfa) {
        // Server indicates MFA is required
        setRequiresMfa(true);
        setError('Please enter your 2FA code');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Invalid email or password');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [superAdminLogin, mustChangePassword, navigate, clearError]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authLogout();
    } catch (err) {
      console.error('Super admin logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authLogout]);

  return {
    login,
    logout,
    isLoading,
    error,
    clearError,
    rateLimitMessage,
    requiresMfa,
    setRequiresMfa,
  };
};

export default useSuperAdminAuth;
