import { create } from "zustand";

// Shared lock flag for kiosk sessions — multiple independent triggers (idle
// timeout, switching away from the tab, exiting fullscreen) all need to lock
// the same screen without knowing about each other, and IdleTimeoutHandler
// (the single place that actually renders KioskLockScreen and handles
// unlocking) needs to react to a lock coming from any of them.
interface KioskLockState {
    locked: boolean;
    lock: () => void;
    unlock: () => void;
}

export const useKioskLockStore = create<KioskLockState>()((set) => ({
    locked: false,
    lock: () => set({ locked: true }),
    unlock: () => set({ locked: false }),
}));
