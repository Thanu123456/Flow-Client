import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKioskLockStore } from '../../store/kiosk/kioskLockStore';

// Best-effort browser-level hardening for kiosk sessions. None of this is a
// substitute for actually deploying the device in a locked-down browser
// (Chrome `--kiosk --app=<url>`, or a dedicated kiosk browser like Fully
// Kiosk Browser on Android) — that's the only thing that can actually stop
// someone leaving the page, closing the tab, or opening DevTools; JS
// running inside the page cannot prevent any of that by itself, and no
// amount of code here changes that. What this *can* do:
//   - lock the screen (reusing the same lock as idle-timeout) the moment the
//     tab is switched away from or minimized — this is the one thing that's
//     both reliable and actually worth having at the JS layer, since walking
//     away mid-sale with the screen left unlocked is the realistic risk;
//   - block the right-click context menu and a few common DevTools shortcuts,
//     which stops casual snooping but not a determined user with keyboard
//     access to the OS.
// Deliberately does NOT use a `beforeunload` "leave site?" prompt: this app
// navigates itself via window.location.href on every logout/end-shift (see
// AuthContext.logout), so that prompt would fire on every intentional exit
// too, not just an accidental tab close — worse UX than the problem it'd solve.
// Renders nothing; pure side effects, active only for kiosk sessions.
const KioskLockdownGuard: React.FC = () => {
    const { isKiosk, isAuthenticated } = useAuth();
    const lock = useKioskLockStore((s) => s.lock);

    useEffect(() => {
        if (!isKiosk || !isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.hidden) lock();
        };

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        // Best-effort only — see file header. A determined user can still
        // reach DevTools via the browser menu; this just removes the
        // one-keystroke shortcuts.
        const blockedKeyCombos = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            const isDevToolsShortcut =
                key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
                (e.ctrlKey && key === 'U');
            if (isDevToolsShortcut) e.preventDefault();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', blockedKeyCombos);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', blockedKeyCombos);
        };
    }, [isKiosk, isAuthenticated, lock]);

    return null;
};

export default KioskLockdownGuard;
