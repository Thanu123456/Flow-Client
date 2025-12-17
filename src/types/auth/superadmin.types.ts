import type { UserInfo } from './auth.types';

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
  remember_me?: boolean;
}

export interface SuperAdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
  must_change_password: boolean;
}
