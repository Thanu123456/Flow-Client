import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

// Landing point for the `/auth/google/callback?code=...` redirect the
// backend sends the browser to after it has finished the OAuth exchange
// with Google. `code` here is a short-lived, one-time handoff code (not a
// token) — this page's only job is to redeem it and route the user onward.
const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    if (!code) {
      navigate(`/login?google_error=${encodeURIComponent('Google sign-in was cancelled or failed.')}`, { replace: true });
      return;
    }

    (async () => {
      try {
        const response = await googleLogin(code);
        messageApi.success('Login Successful');
        navigate(response.must_change_password ? '/change-password' : '/dashboard', { replace: true });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string; error?: { message?: string } } }; message?: string };
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Google sign-in failed. Please try again.';
        navigate(`/login?google_error=${encodeURIComponent(errMsg)}`, { replace: true });
      }
    })();
  }, [searchParams, googleLogin, navigate, messageApi]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      {contextHolder}
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-slate-500 font-medium">Signing you in with Google…</p>
    </div>
  );
};

export default GoogleCallback;
