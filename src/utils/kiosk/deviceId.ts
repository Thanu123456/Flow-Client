// A stable identifier for *this physical kiosk device* (browser install),
// separate from whichever employee happens to be signed in on it — that's
// what lets the fleet view (admin/kiosk-devices) tell devices apart from
// sessions. Generated once and kept in localStorage for as long as this
// browser profile lives; re-pairing the device (KioskDeviceSetup) does not
// reset it, since it's still the same physical hardware.
const DEVICE_ID_KEY = 'kioskDeviceId';

export function getOrCreateDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}
