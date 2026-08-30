import React from "react";
import { Col, Form, InputNumber, Row, Select, Switch, message } from "antd";
import { useSettingsStore } from "../../store/management/settingsStore";
import SettingsSection from "./SettingsSection";
import FieldGroup from "./FieldGroup";
import { useDirtyForm } from "./useDirtyForm";
import type { PosSettingsUpdate } from "../../types/entities/settings.types";

interface Props {
  onDirtyChange?: (dirty: boolean) => void;
}

const col = { xs: 24, sm: 12, lg: 8 };

const SalesSettings: React.FC<Props> = ({ onDirtyChange }) => {
  const { settings, saving, saveSettings } = useSettingsStore();
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

  const { dirty, handleValuesChange, reset, markSaved } = useDirtyForm(
    form,
    initial,
    onDirtyChange
  );

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

  return (
    <SettingsSection
      title="Sales & Checkout"
      description="Defaults and guardrails applied at the point of sale."
      dirty={dirty}
      saving={saving}
      onSave={handleSave}
      onReset={reset}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} style={{ maxWidth: 760 }}>
        <FieldGroup title="Pricing">
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <Form.Item
                name="defaultPriceMode"
                label="Default price mode"
                tooltip="Which price list the POS opens on for a new sale."
              >
                <Select
                  options={[
                    { value: "retail", label: "Retail" },
                    { value: "wholesale", label: "Wholesale" },
                    { value: "our", label: "Our price" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item
                name="salesMaxDiscountPct"
                label="Max discount without approval (%)"
                tooltip="A cashier can apply up to this percentage. Higher discounts will require approval once that flow ships."
                rules={[{ type: "number", min: 0, max: 100 }]}
              >
                <InputNumber min={0} max={100} step={0.5} style={{ width: "100%" }} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item
                name="salesHoldExpiryHours"
                label="Held bill expiry"
                tooltip="Parked / held sales older than this are cleaned up automatically."
                rules={[{ type: "number", min: 1, max: 720 }]}
              >
                <InputNumber min={1} max={720} style={{ width: "100%" }} addonAfter="hrs" />
              </Form.Item>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Checkout behaviour" last>
          <Row gutter={[20, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="allowNoStockBills"
                label="Allow selling out-of-stock items"
                tooltip="Permits a sale to proceed when on-hand stock is insufficient (stock can go negative)."
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cashDrawerEnabled"
                label="Cash drawer integration"
                tooltip="Send an open-drawer signal to a connected receipt printer on cash sales."
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </FieldGroup>
      </Form>
    </SettingsSection>
  );
};

export default SalesSettings;
