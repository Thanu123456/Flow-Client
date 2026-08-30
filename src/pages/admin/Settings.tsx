import React from "react";
import { Card, Grid, Menu, Modal, Result, Spin, Typography, theme } from "antd";
import {
  ShopOutlined,
  PrinterOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useSettingsStore } from "../../store/management/settingsStore";
import { useUnloadGuard } from "../../components/settings/useDirtyForm";
import BusinessProfileSettings from "../../components/settings/BusinessProfileSettings";
import ReceiptSettings from "../../components/settings/ReceiptSettings";
import SalesSettings from "../../components/settings/SalesSettings";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type SectionKey = "business-profile" | "receipt" | "sales";

const SECTIONS: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
  render: (onDirtyChange: (d: boolean) => void) => React.ReactNode;
}[] = [
  {
    key: "business-profile",
    label: "Business Profile",
    icon: <ShopOutlined />,
    render: (onDirtyChange) => <BusinessProfileSettings onDirtyChange={onDirtyChange} />,
  },
  {
    key: "receipt",
    label: "Receipt & Invoice",
    icon: <PrinterOutlined />,
    render: (onDirtyChange) => <ReceiptSettings onDirtyChange={onDirtyChange} />,
  },
  {
    key: "sales",
    label: "Sales & Checkout",
    icon: <ShoppingCartOutlined />,
    render: (onDirtyChange) => <SalesSettings onDirtyChange={onDirtyChange} />,
  },
];

const COMING_SOON = [
  { key: "tax", label: "Tax", icon: <PercentageOutlined /> },
  { key: "payments", label: "Payments", icon: <CreditCardOutlined /> },
  { key: "notifications", label: "Notifications", icon: <BellOutlined /> },
];

const Settings: React.FC = () => {
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const {
    settings,
    businessProfile,
    loading,
    error,
    fetchSettings,
    fetchBusinessProfile,
  } = useSettingsStore();

  const [active, setActive] = React.useState<SectionKey>("business-profile");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    fetchSettings();
    fetchBusinessProfile();
  }, [fetchSettings, fetchBusinessProfile]);

  useUnloadGuard(dirty);

  const switchTo = (key: SectionKey) => {
    if (key === active) return;
    if (dirty) {
      Modal.confirm({
        title: "Discard unsaved changes?",
        content: "You have edits in this section that haven't been saved.",
        okText: "Discard",
        okType: "danger",
        cancelText: "Stay",
        centered: true,
        onOk: () => {
          setDirty(false);
          setActive(key);
        },
      });
      return;
    }
    setActive(key);
  };

  const current = SECTIONS.find((s) => s.key === active)!;
  const firstLoad = loading && !settings && !businessProfile;

  return (
    <div style={{ padding: isMobile ? 16 : "28px 32px", maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Settings
        </Title>
        <Text type="secondary">Configure how your shop and point of sale behave.</Text>
      </div>

      {error && !firstLoad && settings && (
        <Card size="small" style={{ marginBottom: 16, borderColor: token.colorErrorBorder }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}

      <div
        style={{
          display: "flex",
          gap: 24,
          flexDirection: isMobile ? "column" : "row",
          alignItems: "flex-start",
        }}
      >
        <Card
          styles={{ body: { padding: 6 } }}
          style={{
            width: isMobile ? "100%" : 224,
            flexShrink: 0,
            position: isMobile ? "static" : "sticky",
            top: 24,
          }}
        >
          <Menu
            mode={isMobile ? "horizontal" : "inline"}
            selectedKeys={[active]}
            onClick={({ key }) => switchTo(key as SectionKey)}
            style={{ border: "none", background: "transparent" }}
            items={[
              ...SECTIONS.map((s) => ({ key: s.key, icon: s.icon, label: s.label })),
              ...(isMobile
                ? []
                : [
                    { type: "divider" as const },
                    {
                      key: "soon",
                      label: "Coming soon",
                      type: "group" as const,
                      children: COMING_SOON.map((s) => ({
                        key: s.key,
                        icon: s.icon,
                        label: s.label,
                        disabled: true,
                      })),
                    },
                  ]),
            ]}
          />
        </Card>

        <Card
          style={{ flex: 1, width: isMobile ? "100%" : undefined, minWidth: 0 }}
          styles={{ body: { padding: isMobile ? 20 : "28px 32px" } }}
        >
          {firstLoad ? (
            <div style={{ padding: 64, textAlign: "center" }}>
              <Spin />
            </div>
          ) : error && !settings && !businessProfile ? (
            <Result status="warning" title="Couldn't load settings" subTitle={error} />
          ) : (
            current.render(setDirty)
          )}
        </Card>
      </div>
    </div>
  );
};

export default Settings;
