import React from 'react';

interface VirtualKeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'DEL'] as const;

// Touch-first numeric pad shared by the kiosk login screen and the lock
// screen. Key height scales with the viewport (clamp) so a full 4-row pad
// still fits a short landscape tablet, and stays a comfortable tap target on
// a tall portrait phone.
const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ onKeyPress, onBackspace, onClear, disabled }) => {
  const handle = (key: (typeof KEYS)[number]) => {
    if (disabled) return;
    // Tiny haptic tick on devices that support it; ignored elsewhere.
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8);
    if (key === 'DEL') onBackspace();
    else if (key === 'CLEAR') onClear();
    else onKeyPress(key);
  };

  return (
    <div className="vk-pad" role="group" aria-label="Numeric keypad">
      {KEYS.map((key) => {
        const isAction = key === 'DEL' || key === 'CLEAR';
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            className={`vk-key${isAction ? ' vk-key--action' : ''}${key === 'DEL' ? ' vk-key--del' : ''}`}
            aria-label={key === 'DEL' ? 'Backspace' : key === 'CLEAR' ? 'Clear' : key}
            onClick={() => handle(key)}
          >
            {key === 'DEL' ? '⌫' : key === 'CLEAR' ? 'Clear' : key}
          </button>
        );
      })}
      <style>{`
        .vk-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(8px, 1.6vh, 14px);
          width: 100%;
        }
        .vk-key {
          height: clamp(46px, 7.4vh, 72px);
          border: 1px solid #e3e8ef;
          border-radius: 16px;
          background: #fff;
          color: #0f172a;
          font-size: clamp(22px, 3.4vh, 30px);
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
          transition: transform 0.08s ease, background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }
        .vk-key:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
        .vk-key:active:not(:disabled) { transform: scale(0.95); background: #eef2f7; box-shadow: none; }
        .vk-key:focus-visible { outline: 3px solid var(--kl-primary, #1677ff); outline-offset: 2px; }
        .vk-key:disabled { opacity: 0.45; cursor: not-allowed; }
        .vk-key--action {
          background: #f1f5f9;
          color: #475569;
          font-size: clamp(14px, 2.2vh, 17px);
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .vk-key--del { font-size: clamp(22px, 3.2vh, 28px); }
        @media (prefers-reduced-motion: reduce) {
          .vk-key { transition: none; }
        }
      `}</style>
    </div>
  );
};

export default VirtualKeypad;
