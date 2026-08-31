import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AutoComplete, Card, Grid, Input, Menu, Modal, Typography } from "antd";
import {
  ShopOutlined,
  PrinterOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSettingsStore } from "../../store/management/settingsStore";
import { useUnloadGuard } from "../../components/settings/useDirtyForm";
import { searchSettings } from "../../components/settings/settingsIndex";
import SetupChecklist from "../../components/settings/SetupChecklist";
import BusinessProfileSettings from "../../components/settings/BusinessProfileSettings";
import ReceiptSettings from "../../components/settings/ReceiptSettings";
import SalesSettings from "../../components/settings/SalesSettings";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type SectionKey = "business-profile" | "receipt" | "sales";
const DEFAULT_SECTION: SectionKey = "business-profile";

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
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { fetchSettings, fetchBusinessProfile } = useSettingsStore();

  const active: SectionKey =
    SECTIONS.find((s) => s.key === section)?.key ?? DEFAULT_SECTION;

  const [dirty, setDirty] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (section !== active) navigate(`/settings/${active}`, { replace: true });
  }, [section, active, navigate]);

  React.useEffect(() => {
    fetchSettings();
    fetchBusinessProfile();
  }, [fetchSettings, fetchBusinessProfile]);

  useUnloadGuard(dirty);

  // Scroll to a specific field when arriving via ?field= (search box / checklist).
  const scrollField = searchParams.get("field");
  React.useEffect(() => {
    if (!scrollField) return;
    let raf = 0;
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(`setting-${scrollField}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el.querySelector("input, textarea, button, [role='switch']") as HTMLElement | null)?.focus?.();
        const next = new URLSearchParams(searchParams);
        next.delete("field");
        setSearchParams(next, { replace: true });
        return;
      }
      if (tries++ < 30) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollField, active, searchParams, setSearchParams]);

  const goToField = (sectionKey: SectionKey, field: string) => {
    setSearchValue("");
    const run = () => navigate(`/settings/${sectionKey}?field=${field}`);
    if (dirty && sectionKey !== active) {
      Modal.confirm({
        title: "Discard unsaved changes?",
        content: "You have edits in this section that haven't been saved.",
        okText: "Discard",
        okType: "danger",
        cancelText: "Stay",
        centered: true,
        onOk: () => {
          setDirty(false);
          run();
        },
      });
      return;
    }
    run();
  };

  const switchTo = (key: SectionKey) => {
    if (key === active) return;
    const go = () => {
      setDirty(false);
      navigate(`/settings/${key}`);
    };
    if (dirty) {
      Modal.confirm({
        title: "Discard unsaved changes?",
        content: "You have edits in this section that haven't been saved.",
        okText: "Discard",
        okType: "danger",
        cancelText: "Stay",
        centered: true,
        onOk: go,
      });
      return;
    }
    go();
  };

  const results = searchSettings(searchValue);
  const current = SECTIONS.find((s) => s.key === active)!;

  return (
    <div style={{ padding: isMobile ? 16 : "28px 32px", maxWidth: 1320, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Settings
          </Title>
          <Text type="secondary">Configure how your shop and point of sale behave.</Text>
        </div>
        <AutoComplete
          value={searchValue}
          onChange={setSearchValue}
          style={{ width: isMobile ? "100%" : 300 }}
          options={results.map((r) => ({
            value: `${r.section}:${r.field}`,
            label: (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{r.label}</span>
                <span style={{ opacity: 0.55, fontSize: 12 }}>{r.sectionLabel}</span>
              </div>
            ),
          }))}
          onSelect={(v: string) => {
            const [sec, field] = v.split(":");
            goToField(sec as SectionKey, field);
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Search settings…"
          />
        </AutoComplete>
      </div>

      <SetupChecklist />

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
          <React.Fragment key={active}>{current.render(setDirty)}</React.Fragment>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
