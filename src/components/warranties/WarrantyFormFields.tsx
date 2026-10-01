import React from 'react';
import { Form, Input, Select, Switch, InputNumber, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import { MAX_DURATION, PERIOD_OPTIONS, TYPE_OPTIONS } from '../../utils/warranty';

const { TextArea } = Input;

/** Shared field set for the Add / Edit warranty modals. */
const WarrantyFormFields: React.FC<{ form: FormInstance }> = ({ form }) => {
  const period = Form.useWatch('period', form);
  const isLifetime = period === 'lifetime';
  const max = !isLifetime && period ? MAX_DURATION[period as keyof typeof MAX_DURATION] : undefined;

  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="Warranty Name"
            rules={[
              { required: true, message: 'Please enter warranty name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must not exceed 100 characters' },
            ]}
          >
            <Input placeholder="e.g., 6 Month Warranty" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="warrantyType"
            label="Warranty Type"
            tooltip="Manufacturer: backed by the maker. Store: honoured by your shop. Extended: paid add-on cover."
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="duration"
            label="Duration"
            dependencies={['period']}
            rules={[
              {
                validator: (_, value) => {
                  if (isLifetime) return Promise.resolve();
                  if (!value) return Promise.reject(new Error('Please enter warranty duration'));
                  if (max && value > max) return Promise.reject(new Error(`Cannot exceed ${max} ${period}s`));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1}
              max={max}
              precision={0}
              placeholder={isLifetime ? 'Not needed for lifetime' : 'e.g., 6'}
              disabled={isLifetime}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="period" label="Period" rules={[{ required: true, message: 'Please select period' }]}>
            <Select options={PERIOD_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description" rules={[{ max: 500, message: 'Description must not exceed 500 characters' }]}>
        <TextArea rows={2} placeholder="Short description (optional)" />
      </Form.Item>

      <Form.Item
        name="terms"
        label="Terms & Coverage"
        tooltip="What is covered. Printed on the digital receipt."
        rules={[{ max: 2000, message: 'Must not exceed 2000 characters' }]}
      >
        <TextArea rows={3} placeholder="e.g., Free repair or replacement for manufacturing defects" />
      </Form.Item>

      <Form.Item
        name="exclusions"
        label="Exclusions"
        tooltip="What is NOT covered (physical damage, liquid damage, misuse…)."
        rules={[{ max: 2000, message: 'Must not exceed 2000 characters' }]}
      >
        <TextArea rows={3} placeholder="e.g., Physical or liquid damage, unauthorised repairs" />
      </Form.Item>

      <Form.Item name="isActive" label="Status" valuePropName="checked" extra="Only active warranties are attached to new sales.">
        <Switch />
      </Form.Item>
    </>
  );
};

export default WarrantyFormFields;
