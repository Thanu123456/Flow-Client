import React, { useEffect, useState } from "react";
import {
  Table, Button, Tag, Space, Typography, Modal, Form, Input, Select,
  Switch, InputNumber, message, Popconfirm, Card, Divider,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { stockAdjustmentService } from "../../services/inventory/stockAdjustmentService";
import type { AdjustmentReason, GLAccount } from "../../types/entities/stockAdjustment.types";

const { Option } = Select;

const SCOPE_LABEL: Record<string, string> = { in: "Stock In", out: "Stock Out", both: "Both" };

const AdjustmentReasonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reasons, setReasons] = useState<AdjustmentReason[]>([]);
  const [expenseCats, setExpenseCats] = useState<{ id: string; name: string }[]>([]);
  const [glAccounts, setGlAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdjustmentReason | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [threshold, setThreshold] = useState<number>(0);
  const [glLock, setGlLock] = useState<string | null>(null);
  const [savingThreshold, setSavingThreshold] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r, c, g, s] = await Promise.all([
        stockAdjustmentService.listReasons(false),
        stockAdjustmentService.listExpenseCategories(),
        stockAdjustmentService.listGLAccounts(),
        stockAdjustmentService.getSettings(),
      ]);
      setReasons(r);
      setExpenseCats(c);
      setGlAccounts(g);
      setThreshold(s.approvalThreshold);
      setGlLock(s.glLockBeforeDate ?? null);
    } catch {
      message.error("Failed to load reason codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ movementScope: "both", requiresApproval: false, isActive: true, sortOrder: 100 });
    setModalOpen(true);
  };

  const openEdit = (r: AdjustmentReason) => {
    setEditing(r);
    form.setFieldsValue({
      code: r.code, label: r.label, movementScope: r.movementScope,
      expenseCategoryId: r.expenseCategoryId, glAccountId: r.glAccountId,
      requiresApproval: r.requiresApproval, isActive: r.isActive, sortOrder: r.sortOrder,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    try {
      if (editing) {
        await stockAdjustmentService.updateReason(editing.id, v);
        message.success("Reason updated");
      } else {
        await stockAdjustmentService.createReason(v);
        message.success("Reason created");
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Save failed");
    }
  };

  const remove = async (id: string) => {
    try {
      await stockAdjustmentService.deleteReason(id);
      message.success("Reason deleted");
      load();
    } catch (e: any) {
      message.error(e?.message ?? "Delete failed");
    }
  };

  const saveThreshold = async () => {
    setSavingThreshold(true);
    try {
      await stockAdjustmentService.updateSettings(threshold, glLock);
      message.success("Settings saved");
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Save failed");
    } finally {
      setSavingThreshold(false);
    }
  };

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", render: (v: string) => <code>{v}</code> },
    { title: "Label", dataIndex: "label", key: "label" },
    { title: "Scope", dataIndex: "movementScope", key: "scope", render: (v: string) => <Tag>{SCOPE_LABEL[v] ?? v}</Tag> },
    {
      title: "Expense Account", dataIndex: "expenseCategoryName", key: "gl",
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Approval", dataIndex: "requiresApproval", key: "approval",
      render: (v: boolean) => (v ? <Tag color="gold">Required</Tag> : <span style={{ color: "#9ca3af" }}>—</span>),
    },
    {
      title: "Active", dataIndex: "isActive", key: "active",
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
    },
    {
      title: "", key: "actions", align: "right" as const,
      render: (_: any, r: AdjustmentReason) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete this reason code?" onConfirm={() => remove(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/adjustments")} style={{ padding: 0, marginBottom: 4 }}>
        Back to Adjustments
      </Button>
      <Typography.Title level={4} style={{ marginTop: 0 }}>Adjustment Reason Codes</Typography.Title>

      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space align="center" wrap>
            <Typography.Text strong>Approval threshold</Typography.Text>
            <InputNumber
              min={0}
              value={threshold}
              onChange={(v) => setThreshold(v ?? 0)}
              style={{ width: 180 }}
              addonBefore="Rs."
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Adjustments at or above this value go to "Pending Approval". 0 disables value-based approval.
            </Typography.Text>
          </Space>
          <Space align="center" wrap>
            <Typography.Text strong>GL period lock</Typography.Text>
            <DatePicker
              value={glLock ? dayjs(glLock) : null}
              onChange={(d) => setGlLock(d ? d.format("YYYY-MM-DD") : null)}
              placeholder="No lock"
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              No journal entry may be dated on or before this date.
            </Typography.Text>
          </Space>
          <Button type="primary" icon={<SaveOutlined />} loading={savingThreshold} onClick={saveThreshold}>Save Settings</Button>
        </Space>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Reason Code</Button>
      </div>

      <Table
        dataSource={reasons}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        title={editing ? "Edit Reason Code" : "New Reason Code"}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. breakage" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="label" label="Label" rules={[{ required: true }]}>
            <Input placeholder="e.g. Breakage / Spillage" />
          </Form.Item>
          <Form.Item name="movementScope" label="Applies To" rules={[{ required: true }]}>
            <Select>
              <Option value="both">Both</Option>
              <Option value="in">Stock In</Option>
              <Option value="out">Stock Out</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="glAccountId"
            label="GL Contra Account"
            tooltip="The account posted opposite Inventory Asset. Defaults to Shrinkage (out) / Adjustment Gain (in)."
          >
            <Select allowClear placeholder="Default (Shrinkage / Gain)">
              {glAccounts.map((a) => <Option key={a.id} value={a.id}>{a.code} — {a.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="expenseCategoryId" label="Expense Category (legacy P&L feed)">
            <Select allowClear placeholder="None">
              {expenseCats.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Divider style={{ margin: "8px 0" }} />
          <Space size="large">
            <Form.Item name="requiresApproval" label="Requires approval" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort order">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default AdjustmentReasonsPage;
