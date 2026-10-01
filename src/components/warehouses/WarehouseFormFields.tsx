import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Switch, Row, Col } from "antd";
import { userService } from "../../services/management/userService";
import { WAREHOUSE_TYPE_OPTIONS, isSellableWarehouseType } from "../../utils/warehouse";

const { TextArea } = Input;

interface Props {
  /** The warehouse being edited is currently the shop default (the default switch is then locked on). */
  isCurrentDefault?: boolean;
  /** Name of the current manager, shown while the user list loads / when it can't be loaded. */
  currentManager?: { id: string; name: string };
  isEdit?: boolean;
}

/** Shared field set for the Add / Edit warehouse modals. */
const WarehouseFormFields: React.FC<Props> = ({ isCurrentDefault, currentManager, isEdit }) => {
  const form = Form.useFormInstance();
  const type = Form.useWatch("warehouseType", form);
  const status = Form.useWatch("status", form);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    userService
      .getUsers({ page: 1, limit: 100, status: "active" } as any)
      .then((r) => {
        if (!cancelled) setUsers(r.data.map((u) => ({ value: u.id, label: u.fullName })));
      })
      .catch(() => {
        /* needs the users permission — the manager picker just stays limited */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const managerOptions =
    currentManager && !users.some((u) => u.value === currentManager.id)
      ? [{ value: currentManager.id, label: currentManager.name }, ...users]
      : users;

  const canBeDefault = isSellableWarehouseType(type) && status !== false;

  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Warehouse Name"
            name="name"
            rules={[
              { required: true, message: "Please enter Warehouse Name" },
              { min: 2, max: 100, message: "Name must be between 2 and 100 characters" },
            ]}
          >
            <Input placeholder="Enter Warehouse Name" maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Code"
            name="code"
            tooltip={isEdit ? undefined : "Leave blank to generate the next WH-### code"}
            rules={[
              { max: 30, message: "Code must be at most 30 characters" },
              ...(isEdit ? [{ required: true, message: "Please enter a code" }] : []),
            ]}
            normalize={(v) => (typeof v === "string" ? v.toUpperCase() : v)}
          >
            <Input placeholder={isEdit ? "e.g. WH-001" : "Auto-generated if blank"} maxLength={30} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Type" name="warehouseType" rules={[{ required: true, message: "Select a type" }]}>
            <Select
              options={WAREHOUSE_TYPE_OPTIONS.map((o) => ({
                value: o.value,
                label: (
                  <span title={o.hint}>
                    {o.label}
                  </span>
                ),
              }))}
              disabled={isCurrentDefault && !isSellableWarehouseType(type)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Manager" name="managerUserId">
            <Select allowClear showSearch optionFilterProp="label" placeholder="Select manager" options={managerOptions} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Capacity"
            name="capacity"
            tooltip="Total quantity this warehouse can hold, measured against the sum of on-hand quantities. Leave empty for no limit."
          >
            <InputNumber min={0} precision={0} style={{ width: "100%" }} placeholder="No limit" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Contact Person" name="contactPerson" rules={[{ max: 100, message: "Contact person must be less than 100 characters" }]}>
            <Input placeholder="Enter Contact Person" maxLength={100} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: "email", message: "Please enter a valid email" },
              { max: 255, message: "Email must be less than 255 characters" },
            ]}
          >
            <Input placeholder="Enter Email" maxLength={255} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mobile" name="mobile" rules={[{ max: 20, message: "Mobile must be less than 20 characters" }]}>
            <Input placeholder="Enter Mobile Number" maxLength={20} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Phone" name="phone" rules={[{ max: 20, message: "Phone must be less than 20 characters" }]}>
            <Input placeholder="Enter Phone Number" maxLength={20} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="City" name="city" rules={[{ max: 100, message: "City must be less than 100 characters" }]}>
            <Input placeholder="Enter City" maxLength={100} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Address" name="address" rules={[{ max: 500, message: "Address must be less than 500 characters" }]}>
        <TextArea rows={3} placeholder="Enter Address" maxLength={500} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch disabled={isCurrentDefault} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Default warehouse"
            name="isDefault"
            valuePropName="checked"
            tooltip="The warehouse the POS sells from when nothing more specific (user, shift, register) is set. Only one warehouse is the default."
            extra={isCurrentDefault ? "To change the default, make another warehouse the default." : !canBeDefault ? "Must be active and a store or distribution warehouse." : undefined}
          >
            <Switch disabled={isCurrentDefault || !canBeDefault} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default WarehouseFormFields;
