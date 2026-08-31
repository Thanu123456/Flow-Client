import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Progress, Space, Typography, theme } from "antd";
import { CheckCircleFilled, RightOutlined } from "@ant-design/icons";
import { useSettingsStore } from "../../store/management/settingsStore";

const { Text } = Typography;
const DISMISS_KEY = "settings-checklist-dismissed";

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/** A "getting started" card that reads real state and links into each section. */
const SetupChecklist: React.FC = () => {
  const { token } = theme.useToken();
  const { settings, businessProfile } = useSettingsStore();
  const [dismissed, setDismissed] = React.useState(readDismissed);

  const items = React.useMemo(
    () => [
      {
        done: !!businessProfile?.logoUrl,
        label: "Add your shop logo",
        to: "/settings/business-profile",
        field: "logoUrl",
      },
      {
        done: !!(businessProfile?.taxVatNumber || businessProfile?.businessRegistrationNumber),
        label: "Add your tax / registration number",
        to: "/settings/business-profile",
        field: "taxVatNumber",
      },
      {
        done: !!businessProfile?.email,
        label: "Add a contact email",
        to: "/settings/business-profile",
        field: "email",
      },
      {
        done: !!settings?.receiptFooterText,
        label: "Set a receipt footer line",
        to: "/settings/receipt",
        field: "receiptFooterText",
      },
    ],
    [businessProfile, settings]
  );

  if (!settings || !businessProfile) return null;

  const doneCount = items.filter((i) => i.done).length;
  const complete = doneCount === items.length;
  if (complete || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 20, borderColor: token.colorPrimaryBorder }}
      styles={{ body: { padding: "14px 18px" } }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Space size={12} align="center">
          <Progress
            type="circle"
            size={40}
            percent={Math.round((doneCount / items.length) * 100)}
            format={() => `${doneCount}/${items.length}`}
          />
          <div>
            <Text strong>Finish setting up your shop</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12.5 }}>
                A few details make receipts and reports look right.
              </Text>
            </div>
          </div>
        </Space>
        <Button type="text" size="small" onClick={dismiss} style={{ color: token.colorTextTertiary }}>
          Dismiss
        </Button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <Link
            key={item.label}
            to={`${item.to}?field=${item.field}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${token.colorBorderSecondary}`,
              color: item.done ? token.colorTextTertiary : token.colorText,
              textDecoration: item.done ? "line-through" : "none",
              background: item.done ? token.colorFillQuaternary : token.colorBgContainer,
            }}
          >
            {item.done ? (
              <CheckCircleFilled style={{ color: token.colorSuccess }} />
            ) : (
              <RightOutlined style={{ fontSize: 10 }} />
            )}
            {item.label}
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default SetupChecklist;
