import React, { useRef, useState, useEffect } from 'react';
import { Input } from 'antd';

interface PINInputProps {
  length?: number;
  disabled?: boolean;
  onChange?: (pin: string) => void;
  autoFocus?: boolean;
}

const PINInput: React.FC<PINInputProps> = ({
  length = 6,
  disabled = false,
  onChange,
  autoFocus = false,
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Notify parent of complete PIN
    const pin = newValues.join('');
    onChange?.(pin);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        onChange?.(newValues.join(''));
      } else {
        // Clear current input
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
        onChange?.(newValues.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      const newValues = [...values];
      pastedData.split('').forEach((char, i) => {
        if (i < length) {
          newValues[i] = char;
        }
      });
      setValues(newValues);
      onChange?.(newValues.join(''));

      // Focus on the next empty input or last input
      const nextEmptyIndex = newValues.findIndex(v => !v);
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el?.input || null;
          }}
          value={value}
          onChange={(e) => handleChange(index, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={1}
          style={{
            width: 48,
            height: 56,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            borderRadius: 8,
          }}
          type="password"
          inputMode="numeric"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default PINInput;
