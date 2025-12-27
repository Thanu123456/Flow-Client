import { useEffect, useState } from 'react';

// Simple hook to listen for global API errors like 429
export const useApiError = () => {
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setError(customEvent.detail);
        // Auto clear after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    };

    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  return error;
};
