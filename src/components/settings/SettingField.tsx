import React from "react";
import { Form, theme } from "antd";

interface Props {
  name: string;
  label: string;
  /** Visible one-line helper shown under the control (not a hover tooltip). */
  description?: React.ReactNode;
  rules?: any[];
  required?: boolean;
  valuePropName?: string;
  /** true -> a dot next to the label marking an unsaved edit */
  dirty?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * A single setting: label + "modified" dot + visible description, wrapping one
 * AntD Form.Item. Keeps the three settings sections consistent and scannable.
 */
const SettingField: React.FC<Props> = ({
  name,
  label,
  description,
  rules,
  required,
  valuePropName,
  dirty,
  style,
  children,
}) => {
  const { token } = theme.useToken();
  return (
    <div id={`setting-${name}`} style={{ scrollMarginTop: 96 }}>
    <Form.Item
      name={name}
      required={required}
      valuePropName={valuePropName}
      rules={rules}
      style={style}
      label={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {label}
          {dirty && (
            <span
              title="Unsaved change"
              aria-label="unsaved change"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: token.colorWarning,
                display: "inline-block",
              }}
            />
          )}
        </span>
      }
      extra={
        description ? (
          <span style={{ fontSize: 12.5, color: token.colorTextSecondary }}>{description}</span>
        ) : undefined
      }
    >
      {children}
    </Form.Item>
    </div>
  );
};

export default SettingField;
