import React from "react";
import { Col, Form, Input, Row, Select, message } from "antd";
import { useSettingsStore } from "../../store/management/settingsStore";
import ImageUpload from "../common/Upload/ImageUpload";
import SettingsSection from "./SettingsSection";
import FieldGroup from "./FieldGroup";
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
  const { businessProfile, saving, saveBusinessProfile } = useSettingsStore();
  const [form] = Form.useForm();

  const { dirty, handleValuesChange, reset, markSaved } = useDirtyForm(
    form,
    businessProfile,
    onDirtyChange
  );

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

  return (
    <SettingsSection
      title="Business Profile"
      description="Your shop's identity — used on receipts, reports and the storefront."
      dirty={dirty}
      saving={saving}
      onSave={handleSave}
      onReset={reset}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} requiredMark="optional">
        <FieldGroup title="Identity">
          <Row gutter={[20, 0]}>
            <Col xs={24} md={16}>
              <Row gutter={[20, 0]}>
                <Col xs={24} sm={14}>
                  <Form.Item
                    name="shopName"
                    label="Shop name"
                    rules={[
                      { required: true, message: "Shop name is required" },
                      { min: 2, message: "At least 2 characters" },
                    ]}
                  >
                    <Input placeholder="Aruna Super Center" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={10}>
                  <Form.Item name="businessType" label="Business type" rules={[{ required: true }]}>
                    <Select
                      options={BUSINESS_TYPES.map((v) => ({
                        value: v,
                        label: v[0].toUpperCase() + v.slice(1),
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="businessRegistrationNumber" label="Business reg. number">
                    <Input placeholder="Optional" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="taxVatNumber" label="Tax / VAT number">
                    <Input placeholder="Optional" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="logoUrl" label="Logo" tooltip="Shown on receipts and reports. JPEG or PNG, up to 2 MB.">
                <ImageUpload placeholder="Upload shop logo" />
              </Form.Item>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Address">
          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="addressLine1"
                label="Address line 1"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="addressLine2" label="Address line 2">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="postalCode" label="Postal code">
                <Input />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </FieldGroup>

        <FieldGroup title="Contact & locale" last>
          <Row gutter={[20, 0]}>
            <Col {...col}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="011 234 5678" />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input placeholder="shop@example.com" />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                <Select options={CURRENCIES.map((v) => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="timezone" label="Timezone" rules={[{ required: true }]}>
                <Select showSearch options={TIMEZONES.map((v) => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col {...col}>
              <Form.Item name="language" label="Language" rules={[{ required: true }]}>
                <Select options={LANGUAGES} />
              </Form.Item>
            </Col>
          </Row>
        </FieldGroup>
      </Form>
    </SettingsSection>
  );
};

export default BusinessProfileSettings;
