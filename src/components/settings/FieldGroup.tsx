import React from "react";
import { Typography, theme } from "antd";

const { Text } = Typography;

interface FieldGroupProps {
  title: string;
  hint?: string;
  /** Right-aligned slot in the group header (e.g. a small toggle or link). */
  extra?: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}

/**
 * A lightweight settings sub-section: an uppercase label and a hairline rule,
 * instead of a nested card. Keeps long forms scannable without the boxy look.
 */
const FieldGroup: React.FC<FieldGroupProps> = ({ title, hint, extra, children, last }) => {
  const { token } = theme.useToken();
  return (
    <section style={{ marginBottom: last ? 0 : 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          paddingBottom: 8,
          marginBottom: 20,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div>
          <Text
            strong
            style={{
              fontSize: 12,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: token.colorTextSecondary,
            }}
          >
            {title}
          </Text>
          {hint && (
            <div style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 12.5 }}>
                {hint}
              </Text>
            </div>
          )}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
};

export default FieldGroup;
