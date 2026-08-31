import React from "react";
import { Col, Form, Input, InputNumber, Row, Select, Switch, message } from "antd";
import { useSettingsStore } from "../../store/management/settingsStore";
import SettingsSection from "./SettingsSection";
import FieldGroup from "./FieldGroup";
import SettingField from "./SettingField";
import ReceiptPreview from "./ReceiptPreview";
import { SettingsSkeleton, SettingsLoadError } from "./SettingsSkeleton";
import { useDirtyForm } from "./useDirtyForm";
import { RECEIPT_DEFAULTS } from "./settingsDefaults";
import type { PosSettingsUpdate } from "../../types/entities/settings.types";

interface Props {
  onDirtyChange?: (dirty: boolean) => void;
}

const RECEIPT_FIELDS = [
  "receiptPaperSize",
  "receiptTopMarginMm",
  "receiptShowLogo",
  "receiptShowBarcode",
  "receiptShowAddressPhone",
  "receiptShowCashier",
  "receiptShowTaxBreakdown",
  "receiptLanguage",
  "receiptHeaderText",
  "receiptFooterText",
  "receiptCopies",
] as const;

const TOGGLES: [string, string][] = [
  ["receiptShowLogo", "Logo"],
  ["receiptShowAddressPhone", "Address & phone"],
  ["receiptShowCashier", "Cashier name"],
  ["receiptShowBarcode", "Invoice barcode"],
  ["receiptShowTaxBreakdown", "Tax breakdown"],
];

const ReceiptSettings: React.FC<Props> = ({ onDirtyChange }) => {
  const {
    settings,
    businessProfile,
    settingsLoading,
    settingsError,
    saving,
    saveSettings,
    fetchSettings,
    fetchBusinessProfile,
  } = useSettingsStore();
  const [form] = Form.useForm();
  const live = Form.useWatch([], form);

  React.useEffect(() => {
    if (!businessProfile) fetchBusinessProfile();
  }, [businessProfile, fetchBusinessProfile]);

  const initial = React.useMemo(() => {
    if (!settings) return null;
    return RECEIPT_FIELDS.reduce((acc, key) => {
      (acc as any)[key] = (settings as any)[key];
      return acc;
    }, {} as Record<(typeof RECEIPT_FIELDS)[number], any>);
  }, [settings]);

  const { dirty, dirtyFields, dirtyCount, handleValuesChange, reset, markSaved } =
    useDirtyForm(form, initial, onDirtyChange);
  const d = (name: string) => dirtyFields.has(name);

  const resetToDefaults = () => {
    form.setFieldsValue(RECEIPT_DEFAULTS);
    handleValuesChange();
  };

  const handleSave = async () => {
    try {
      const values = (await form.validateFields()) as PosSettingsUpdate;
      await saveSettings(values);
      markSaved();
      message.success("Receipt settings saved");
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("Failed to save receipt settings");
    }
  };

  if (!settings) {
    return settingsError ? (
      <SettingsLoadError message={settingsError} onRetry={fetchSettings} />
    ) : (
      <SettingsSkeleton groups={2} />
    );
  }

  return (
    <SettingsSection
      title="Receipt & Invoice"
      description="How printed and emailed receipts look. Shop name, address and logo come from Business Profile."
      dirty={dirty}
      dirtyCount={dirtyCount}
      saving={saving && !settingsLoading}
      onSave={handleSave}
      onReset={reset}
      onResetDefaults={resetToDefaults}
      updatedAt={settings.updatedAt}
      updatedByName={settings.updatedByName}
    >
      <Row gutter={40}>
        <Col xs={24} lg={16} xl={17}>
          <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
            <FieldGroup title="Paper">
              <Row gutter={[20, 0]}>
                <Col xs={12} sm={6}>
                  <SettingField
                    name="receiptPaperSize"
                    label="Size"
                    dirty={d("receiptPaperSize")}
                    description="Thermal roll width or A4."
                  >
                    <Select
                      options={[
                        { value: "58mm", label: "58 mm" },
                        { value: "80mm", label: "80 mm" },
                        { value: "A4", label: "A4" },
                      ]}
                    />
                  </SettingField>
                </Col>
                <Col xs={12} sm={6}>
                  <SettingField
                    name="receiptTopMarginMm"
                    label="Top margin (mm)"
                    dirty={d("receiptTopMarginMm")}
                    description="Nudge to align with pre-printed paper."
                    rules={[{ type: "number", min: -50, max: 50 }]}
                  >
                    <InputNumber min={-50} max={50} step={0.5} style={{ width: "100%" }} />
                  </SettingField>
                </Col>
                <Col xs={12} sm={6}>
                  <SettingField
                    name="receiptCopies"
                    label="Copies"
                    dirty={d("receiptCopies")}
                    description="Printed per sale."
                    rules={[{ type: "number", min: 1, max: 5 }]}
                  >
                    <InputNumber min={1} max={5} style={{ width: "100%" }} />
                  </SettingField>
                </Col>
                <Col xs={12} sm={6}>
                  <SettingField
                    name="receiptLanguage"
                    label="Language"
                    dirty={d("receiptLanguage")}
                    description="Receipt text language."
                  >
                    <Select
                      options={[
                        { value: "en", label: "English" },
                        { value: "si", label: "Sinhala" },
                        { value: "ta", label: "Tamil" },
                      ]}
                    />
                  </SettingField>
                </Col>
              </Row>
            </FieldGroup>

            <FieldGroup title="Show on receipt" hint="Toggle the blocks that print on every receipt.">
              <Row gutter={[20, 4]}>
                {TOGGLES.map(([name, label]) => (
                  <Col xs={12} sm={8} md={8} key={name}>
                    <SettingField
                      name={name}
                      label={label}
                      valuePropName="checked"
                      dirty={d(name)}
                      style={{ marginBottom: 12 }}
                    >
                      <Switch />
                    </SettingField>
                  </Col>
                ))}
              </Row>
            </FieldGroup>

            <FieldGroup title="Custom text" last>
              <Row gutter={[20, 0]}>
                <Col xs={24} md={12}>
                  <SettingField
                    name="receiptHeaderText"
                    label="Header line"
                    dirty={d("receiptHeaderText")}
                    description="Shown under the address — e.g. a tagline or hotline."
                    rules={[{ max: 280 }]}
                  >
                    <Input.TextArea rows={2} maxLength={280} showCount placeholder="Optional" />
                  </SettingField>
                </Col>
                <Col xs={24} md={12}>
                  <SettingField
                    name="receiptFooterText"
                    label="Footer line"
                    dirty={d("receiptFooterText")}
                    description="Shown below the total."
                    rules={[{ max: 280 }]}
                  >
                    <Input.TextArea
                      rows={2}
                      maxLength={280}
                      showCount
                      placeholder="e.g. Goods once sold are not returnable"
                    />
                  </SettingField>
                </Col>
              </Row>
            </FieldGroup>
          </Form>
        </Col>

        <Col xs={24} lg={8} xl={7}>
          <ReceiptPreview values={live || initial || {}} profile={businessProfile} />
        </Col>
      </Row>
    </SettingsSection>
  );
};

export default ReceiptSettings;
