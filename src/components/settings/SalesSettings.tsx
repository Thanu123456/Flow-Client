import React from "react";
import { Col, Form, Input, InputNumber, Row, Select, Switch, Typography, message } from "antd";
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
            blindCashCount: settings.blindCashCount,
            cashVarianceAlertThreshold: settings.cashVarianceAlertThreshold,
            receiptEmailEnabled: settings.receiptEmailEnabled,
            receiptSmsEnabled: settings.receiptSmsEnabled,
            receiptQrEnabled: settings.receiptQrEnabled,
            emailjsServiceId: settings.emailjsServiceId,
            emailjsTemplateId: settings.emailjsTemplateId,
            emailjsPublicKey: settings.emailjsPublicKey,
            notifylkUserId: settings.notifylkUserId,
            notifylkSenderId: settings.notifylkSenderId,
            // notifylkApiKey deliberately excluded — write-only, the GET side
            // never returns it, so the form always starts with it blank
            // regardless of whether one is already saved server-side.
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
      // The field always starts blank (write-only, see the `initial` memo
      // above) — an untouched or cleared field must NEVER be sent, or every
      // unrelated settings save would wipe out an already-configured key.
      if (!values.notifylkApiKey) {
        delete values.notifylkApiKey;
      }
      await saveSettings(values);
      // Clear the typed key back out of the field — the server never
      // returns it, so leaving old text sitting in a password input would
      // be misleading about what's actually stored now.
      form.setFieldValue("notifylkApiKey", undefined);
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

        <FieldGroup title="Checkout behaviour">
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

        <FieldGroup title="Cash control">
          <Row gutter={[20, 0]}>
            <Col xs={24} sm={12}>
              <SettingField
                name="blindCashCount"
                label="Blind cash count at shift close"
                valuePropName="checked"
                dirty={d("blindCashCount")}
                description="Hides expected cash from the cashier while they count the drawer — a common theft-deterrence pattern. Off shows the expected figure live, which can help a cashier catch a counting mistake sooner."
              >
                <Switch />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="cashVarianceAlertThreshold"
                label="Cash variance alert threshold"
                dirty={d("cashVarianceAlertThreshold")}
                description="A shift ending with a cash variance beyond this amount emails you automatically. Set to 0 to disable."
                rules={[{ type: "number", min: 0 }]}
              >
                <InputNumber min={0} step={50} style={{ width: "100%" }} addonBefore="Rs." />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Digital receipts" last>
          <Row gutter={[20, 0]}>
            <Col xs={24} sm={8}>
              <SettingField
                name="receiptQrEnabled"
                label="QR code on receipt"
                valuePropName="checked"
                dirty={d("receiptQrEnabled")}
                description="Prints a QR code on every receipt linking to a digital copy — no external account needed."
              >
                <Switch />
              </SettingField>
            </Col>
            <Col xs={24} sm={8}>
              <SettingField
                name="receiptEmailEnabled"
                label="Email receipts"
                valuePropName="checked"
                dirty={d("receiptEmailEnabled")}
                description="Lets the cashier email a copy after checkout. Needs the EmailJS details below."
              >
                <Switch />
              </SettingField>
            </Col>
            <Col xs={24} sm={8}>
              <SettingField
                name="receiptSmsEnabled"
                label="SMS receipts"
                valuePropName="checked"
                dirty={d("receiptSmsEnabled")}
                description="Lets the cashier text a copy after checkout. Needs the notify.lk details below."
              >
                <Switch />
              </SettingField>
            </Col>
          </Row>

          <Typography.Text type="secondary" style={{ display: "block", margin: "4px 0 12px", fontSize: 12.5 }}>
            Email is sent from the cashier's browser via{" "}
            <a href="https://www.emailjs.com" target="_blank" rel="noreferrer">EmailJS</a> — create a free account,
            a service and a template there, then paste the three IDs below. The template can use variables like{" "}
            <code>shop_name</code>, <code>invoice_number</code>, <code>total</code> and <code>receipt_url</code>.
          </Typography.Text>
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <SettingField name="emailjsServiceId" label="EmailJS Service ID" dirty={d("emailjsServiceId")}>
                <Input placeholder="service_xxxxxxx" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField name="emailjsTemplateId" label="EmailJS Template ID" dirty={d("emailjsTemplateId")}>
                <Input placeholder="template_xxxxxxx" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField name="emailjsPublicKey" label="EmailJS Public Key" dirty={d("emailjsPublicKey")}>
                <Input placeholder="e.g. AbCdEfGhIjKlMnOp" />
              </SettingField>
            </Col>
          </Row>

          <Typography.Text type="secondary" style={{ display: "block", margin: "4px 0 12px", fontSize: 12.5 }}>
            SMS is sent from the server via{" "}
            <a href="https://notify.lk" target="_blank" rel="noreferrer">notify.lk</a> — your User ID, API Key and
            an approved Sender ID are on your notify.lk account's API Keys page.
          </Typography.Text>
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <SettingField name="notifylkUserId" label="notify.lk User ID" dirty={d("notifylkUserId")}>
                <Input placeholder="e.g. 12345" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField name="notifylkSenderId" label="notify.lk Sender ID" dirty={d("notifylkSenderId")}>
                <Input placeholder="NotifyDEMO for testing" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="notifylkApiKey"
                label="notify.lk API Key"
                dirty={d("notifylkApiKey")}
                description={
                  settings.notifylkApiKeySet
                    ? "A key is already saved — leave blank to keep it."
                    : "No key saved yet."
                }
              >
                <Input.Password placeholder="Paste to set or replace" autoComplete="new-password" />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>
      </Form>
    </SettingsSection>
  );
};

export default SalesSettings;
