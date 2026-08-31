import React from "react";
import { Button, Popconfirm, Space, Typography, theme } from "antd";
import { SaveOutlined, UndoOutlined } from "@ant-design/icons";
import LastSaved from "./LastSaved";

const { Title, Text } = Typography;

interface SettingsSectionProps {
  title: string;
  description?: string;
  dirty: boolean;
  dirtyCount?: number;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  /** When provided, shows a "Reset to defaults" action in the header. */
  onResetDefaults?: () => void;
  updatedAt?: string;
  updatedByName?: string;
  children: React.ReactNode;
}

/**
 * Section frame: heading (focused on mount for keyboard users), a "last saved"
 * line, an optional "reset to defaults" action, and a sticky save bar that
 * appears only while the section has unsaved edits.
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  dirty,
  dirtyCount = 0,
  saving = false,
  onSave,
  onReset,
  onResetDefaults,
  updatedAt,
  updatedByName,
  children,
}) => {
  const { token } = theme.useToken();
  const headingRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // Move focus to the section heading when a section mounts (rail switch /
    // deep link), so keyboard and screen-reader users land in the right place.
    const el = headingRef.current;
    if (el) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  }, []);

  const changeLabel =
    dirtyCount > 0
      ? `${dirtyCount} unsaved ${dirtyCount === 1 ? "change" : "changes"}`
      : "Unsaved changes";

  return (
    <div style={{ position: "relative", paddingBottom: dirty ? 76 : 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, outline: "none" }} ref={headingRef}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {description}
            </Text>
          )}
          <div style={{ marginTop: 4 }}>
            <LastSaved updatedAt={updatedAt} by={updatedByName} />
          </div>
        </div>

        {onResetDefaults && (
          <Popconfirm
            title="Reset this section to defaults?"
            description="Fields return to factory defaults. You still need to Save."
            okText="Reset"
            cancelText="Cancel"
            onConfirm={onResetDefaults}
          >
            <Button size="small" type="text" style={{ color: token.colorTextSecondary, flexShrink: 0 }}>
              Reset to defaults
            </Button>
          </Popconfirm>
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
          <Space size={8}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: token.colorWarning,
                display: "inline-block",
              }}
            />
            <Text style={{ fontSize: 13 }}>{changeLabel}</Text>
          </Space>
          <Space>
            <Button icon={<UndoOutlined />} onClick={onReset} disabled={saving}>
              Discard
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={onSave} loading={saving}>
              Save changes
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
