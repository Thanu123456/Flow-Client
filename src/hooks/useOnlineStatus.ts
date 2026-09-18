import { useEffect, useState } from 'react';

// Wraps the browser's online/offline events. navigator.onLine only reflects
// network-adapter state (a Wi-Fi link with no real internet still reads
// "online"), so this is a best-effort signal, not a guarantee the API is
// reachable — actual sale submission still has to handle a failed request
// regardless of what this says.
export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return online;
}

export default useOnlineStatus;
