import React from "react";
import { Button, Space, Typography, theme } from "antd";
import { SaveOutlined, UndoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface SettingsSectionProps {
  title: string;
  description?: string;
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

/**
 * Section frame with a sticky save bar that only appears while the section has
 * unsaved edits — mirrors the desktop Setting form's "Save enabled when dirty".
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  dirty,
  saving = false,
  onSave,
  onReset,
  children,
}) => {
  const { token } = theme.useToken();

  return (
    <div style={{ position: "relative", paddingBottom: dirty ? 72 : 0 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {description}
          </Text>
        )}
      </div>

      {children}

      {dirty && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 24,
            padding: "12px 16px",
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            zIndex: 5,
          }}
        >
          <Text type="secondary" style={{ fontSize: 13 }}>
            You have unsaved changes
          </Text>
          <Space>
            <Button icon={<UndoOutlined />} onClick={onReset} disabled={saving}>
              Discard
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={saving}
            >
              Save changes
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
