import api, { API_URL } from '../../utils/api';
import type { LoginResponse } from '../../types/auth/auth.types';

export const googleAuthService = {
  // Full-page navigation target: kicks off the server-side OAuth redirect
  // to Google. Not an axios call — the browser has to actually navigate.
  getLoginUrl(): string {
    return `${API_URL}/auth/google`;
  },

  // Redeems the one-time code the backend appended to the
  // /auth/google/callback redirect for the real token pair.
  async exchangeCode(code: string): Promise<LoginResponse> {
    const response = await api.post<{ data: LoginResponse }>('/auth/google/exchange', { code });
    return response.data.data;
  },
};
