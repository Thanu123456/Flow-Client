import React from "react";
import { Col, Form, InputNumber, Row, Select, Switch, message } from "antd";
import { useSettingsStore } from "../../store/management/settingsStore";
import SettingsSection from "./SettingsSection";
import FieldGroup from "./FieldGroup";
import SettingField from "./SettingField";
import { SettingsSkeleton, SettingsLoadError } from "./SettingsSkeleton";
import { useDirtyForm } from "./useDirtyForm";
import { SALES_DEFAULTS } from "./settingsDefaults";
import type { PosSettingsUpdate } from "../../types/entities/settings.types";

interface Props {
  onDirtyChange?: (dirty: boolean) => void;
}

const col = { xs: 24, sm: 12, lg: 8 };

const SalesSettings: React.FC<Props> = ({ onDirtyChange }) => {
  const { settings, settingsLoading, settingsError, saving, saveSettings, fetchSettings } =
    useSettingsStore();
  const [form] = Form.useForm();

  const initial = React.useMemo(
    () =>
      settings
        ? {
            defaultPriceMode: settings.defaultPriceMode,
            allowNoStockBills: settings.allowNoStockBills,
            cashDrawerEnabled: settings.cashDrawerEnabled,
            salesMaxDiscountPct: settings.salesMaxDiscountPct,
            salesHoldExpiryHours: settings.salesHoldExpiryHours,
          }
        : null,
    [settings]
  );

  const { dirty, dirtyFields, dirtyCount, handleValuesChange, reset, markSaved } =
    useDirtyForm(form, initial, onDirtyChange);
  const d = (name: string) => dirtyFields.has(name);

  const resetToDefaults = () => {
    form.setFieldsValue(SALES_DEFAULTS);
    handleValuesChange();
  };

  const handleSave = async () => {
    try {
      const values = (await form.validateFields()) as PosSettingsUpdate;
      await saveSettings(values);
      markSaved();
      message.success("Sales settings saved");
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("Failed to save sales settings");
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
      title="Sales & Checkout"
      description="Defaults and guardrails applied at the point of sale."
      dirty={dirty}
      dirtyCount={dirtyCount}
      saving={saving && !settingsLoading}
      onSave={handleSave}
      onReset={reset}
      onResetDefaults={resetToDefaults}
      updatedAt={settings.updatedAt}
      updatedByName={settings.updatedByName}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} style={{ maxWidth: 760 }}>
        <FieldGroup title="Pricing">
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <SettingField
                name="defaultPriceMode"
                label="Default price mode"
                dirty={d("defaultPriceMode")}
                description="Which price list a new sale opens on. Affects POS checkout."
              >
                <Select
                  options={[
                    { value: "retail", label: "Retail" },
                    { value: "wholesale", label: "Wholesale" },
                    { value: "our", label: "Our price" },
                  ]}
                />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="salesMaxDiscountPct"
                label="Max discount without approval"
                dirty={d("salesMaxDiscountPct")}
                description="Cashiers can apply up to this much; more will need approval once that ships."
                rules={[{ type: "number", min: 0, max: 100 }]}
              >
                <InputNumber min={0} max={100} step={0.5} style={{ width: "100%" }} addonAfter="%" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="salesHoldExpiryHours"
                label="Held bill expiry"
                dirty={d("salesHoldExpiryHours")}
                description="Parked sales older than this are cleared automatically."
                rules={[{ type: "number", min: 1, max: 720 }]}
              >
                <InputNumber min={1} max={720} style={{ width: "100%" }} addonAfter="hrs" />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Checkout behaviour" last>
          <Row gutter={[20, 0]}>
            <Col xs={24} sm={12}>
              <SettingField
                name="allowNoStockBills"
                label="Allow selling out-of-stock items"
                valuePropName="checked"
                dirty={d("allowNoStockBills")}
                description="Lets a sale proceed when on-hand stock is insufficient (stock can go negative)."
              >
                <Switch />
              </SettingField>
            </Col>
            <Col xs={24} sm={12}>
              <SettingField
                name="cashDrawerEnabled"
                label="Cash drawer integration"
                valuePropName="checked"
                dirty={d("cashDrawerEnabled")}
                description="Sends an open-drawer signal to a connected receipt printer on cash sales."
              >
                <Switch />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>
      </Form>
    </SettingsSection>
  );
};

export default SalesSettings;
