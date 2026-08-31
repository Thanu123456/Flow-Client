import React from "react";
import { Col, Form, Input, Row, Select, message } from "antd";
import { useSettingsStore } from "../../store/management/settingsStore";
import ImageUpload from "../common/Upload/ImageUpload";
import SettingsSection from "./SettingsSection";
import FieldGroup from "./FieldGroup";
import SettingField from "./SettingField";
import { SettingsSkeleton, SettingsLoadError } from "./SettingsSkeleton";
import { useDirtyForm } from "./useDirtyForm";
import type { BusinessProfileUpdate } from "../../types/entities/settings.types";

interface Props {
  onDirtyChange?: (dirty: boolean) => void;
}

const BUSINESS_TYPES = [
  "retail",
  "wholesale",
  "restaurant",
  "cafe",
  "pharmacy",
  "supermarket",
  "other",
];

const CURRENCIES = ["LKR", "USD", "EUR", "GBP", "INR", "AUD"];
const TIMEZONES = ["Asia/Colombo", "Asia/Kolkata", "Asia/Dubai", "UTC"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "si", label: "Sinhala" },
  { value: "ta", label: "Tamil" },
];

const col = { xs: 24, sm: 12, lg: 8 };

const BusinessProfileSettings: React.FC<Props> = ({ onDirtyChange }) => {
  const {
    businessProfile,
    profileLoading,
    profileError,
    saving,
    saveBusinessProfile,
    fetchBusinessProfile,
  } = useSettingsStore();
  const [form] = Form.useForm();

  const { dirty, dirtyFields, dirtyCount, handleValuesChange, reset, markSaved } =
    useDirtyForm(form, businessProfile, onDirtyChange);
  const d = (name: string) => dirtyFields.has(name);

  const handleSave = async () => {
    try {
      const values = (await form.validateFields()) as BusinessProfileUpdate;
      await saveBusinessProfile(values);
      markSaved();
      message.success("Business profile saved");
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("Failed to save business profile");
    }
  };

  if (!businessProfile) {
    return profileError ? (
      <SettingsLoadError message={profileError} onRetry={fetchBusinessProfile} />
    ) : (
      <SettingsSkeleton groups={3} />
    );
  }

  return (
    <SettingsSection
      title="Business Profile"
      description="Your shop's identity — used on receipts, reports and the storefront."
      dirty={dirty}
      dirtyCount={dirtyCount}
      saving={saving && !profileLoading}
      onSave={handleSave}
      onReset={reset}
      updatedAt={businessProfile.updatedAt}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} requiredMark="optional">
        <FieldGroup title="Identity">
          <Row gutter={[20, 0]}>
            <Col xs={24} md={16}>
              <Row gutter={[20, 0]}>
                <Col xs={24} sm={14}>
                  <SettingField
                    name="shopName"
                    label="Shop name"
                    dirty={d("shopName")}
                    description="Printed at the top of every receipt."
                    rules={[
                      { required: true, message: "Shop name is required" },
                      { min: 2, message: "At least 2 characters" },
                    ]}
                  >
                    <Input placeholder="Aruna Super Center" />
                  </SettingField>
                </Col>
                <Col xs={24} sm={10}>
                  <SettingField
                    name="businessType"
                    label="Business type"
                    dirty={d("businessType")}
                    description="Tunes defaults and reporting."
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={BUSINESS_TYPES.map((v) => ({
                        value: v,
                        label: v[0].toUpperCase() + v.slice(1),
                      }))}
                    />
                  </SettingField>
                </Col>
                <Col xs={24} sm={12}>
                  <SettingField
                    name="businessRegistrationNumber"
                    label="Business reg. number"
                    dirty={d("businessRegistrationNumber")}
                    description="Optional. Shown on tax invoices."
                  >
                    <Input placeholder="Optional" />
                  </SettingField>
                </Col>
                <Col xs={24} sm={12}>
                  <SettingField
                    name="taxVatNumber"
                    label="Tax / VAT number"
                    dirty={d("taxVatNumber")}
                    description="Optional. Shown on tax invoices."
                  >
                    <Input placeholder="Optional" />
                  </SettingField>
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <SettingField
                name="logoUrl"
                label="Logo"
                dirty={d("logoUrl")}
                description="Shown on receipts and reports. JPEG or PNG, up to 2 MB."
              >
                <ImageUpload placeholder="Upload shop logo" />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Address">
          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <SettingField
                name="addressLine1"
                label="Address line 1"
                dirty={d("addressLine1")}
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input />
              </SettingField>
            </Col>
            <Col xs={24} md={12}>
              <SettingField name="addressLine2" label="Address line 2" dirty={d("addressLine2")}>
                <Input placeholder="Optional" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField name="city" label="City" dirty={d("city")} rules={[{ required: true }]}>
                <Input />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField name="postalCode" label="Postal code" dirty={d("postalCode")}>
                <Input />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="country"
                label="Country"
                dirty={d("country")}
                rules={[{ required: true }]}
              >
                <Input />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Contact & locale" last>
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <SettingField
                name="phone"
                label="Phone"
                dirty={d("phone")}
                description="Shown on the receipt header."
              >
                <Input placeholder="011 234 5678" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="email"
                label="Email"
                dirty={d("email")}
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input placeholder="shop@example.com" />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="currency"
                label="Currency"
                dirty={d("currency")}
                description="Used across the POS and reports."
                rules={[{ required: true }]}
              >
                <Select options={CURRENCIES.map((v) => ({ value: v, label: v }))} />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="timezone"
                label="Timezone"
                dirty={d("timezone")}
                description="Timestamps on sales and shifts."
                rules={[{ required: true }]}
              >
                <Select showSearch options={TIMEZONES.map((v) => ({ value: v, label: v }))} />
              </SettingField>
            </Col>
            <Col {...col}>
              <SettingField
                name="language"
                label="Language"
                dirty={d("language")}
                rules={[{ required: true }]}
              >
                <Select options={LANGUAGES} />
              </SettingField>
            </Col>
          </Row>
        </FieldGroup>
      </Form>
    </SettingsSection>
  );
};

export default BusinessProfileSettings;
