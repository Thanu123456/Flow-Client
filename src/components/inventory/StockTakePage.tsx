import React, { useCallback, useEffect, useState } from "react";
import {
  Table, Button, Tag, Space, Typography, Modal, Form, Select, Input, message, Progress,
} from "antd";
import { PlusOutlined, EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { stockTakeService } from "../../services/inventory/stockTakeService";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { useCategoryStore } from "../../store/management/categoryStore";
import type { StockTakeListItem, StockTakeStatus } from "../../types/entities/stockAdjustment.types";

const { Option } = Select;

const STATUS_META: Record<StockTakeStatus, { color: string; label: string }> = {
  in_progress: { color: "blue", label: "In Progress" },
  counted: { color: "gold", label: "Counted" },
  posted: { color: "green", label: "Posted" },
  cancelled: { color: "default", label: "Cancelled" },
};

const StockTakePage: React.FC = () => {
  const navigate = useNavigate();
  const { allWarehouses: warehouses, getAllWarehouses } = useWarehouseStore();
  const { allCategories: categories, getAllCategories } = useCategoryStore();

  const [rows, setRows] = useState<StockTakeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await stockTakeService.list({ page: p, perPage: 20 });
      setRows(res.stockTakes);
      setTotal(res.total);
      setPage(p);
    } catch {
      message.error("Failed to load stock takes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!warehouses.length) getAllWarehouses();
    if (!categories.length) getAllCategories();
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    const v = await form.validateFields();
    setCreating(true);
    try {
      const st = await stockTakeService.create({
        warehouse_id: v.warehouseId,
        category_id: v.categoryId || undefined,
        notes: v.notes || undefined,
      });
      message.success(`Stock take ${st.referenceNumber} started`);
      setModalOpen(false);
      form.resetFields();
      navigate(`/stock-takes/${st.id}`);
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Failed to start stock take");
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { title: "Reference", dataIndex: "referenceNumber", key: "ref", render: (v: string) => <code style={{ fontWeight: 600 }}>{v}</code> },
    { title: "Warehouse", dataIndex: "warehouseName", key: "wh" },
    { title: "Category", dataIndex: "categoryName", key: "cat", render: (v: string) => v || <span style={{ color: "#9ca3af" }}>All</span> },
    {
      title: "Progress", key: "progress",
      render: (_: any, r: StockTakeListItem) => (
        <Space direction="vertical" size={0} style={{ width: 140 }}>
          <Progress percent={r.itemCount ? Math.round((r.countedCount / r.itemCount) * 100) : 0} size="small" />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.countedCount} / {r.itemCount} counted</span>
        </Space>
      ),
    },
    { title: "Status", dataIndex: "status", key: "status", render: (v: StockTakeStatus) => <Tag color={STATUS_META[v]?.color}>{STATUS_META[v]?.label ?? v}</Tag> },
    { title: "By", dataIndex: "createdByName", key: "by", render: (v: string) => v || "—" },
    { title: "Date", dataIndex: "createdAt", key: "date", render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm") },
    {
      title: "", key: "actions", align: "right" as const,
      render: (_: any, r: StockTakeListItem) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/stock-takes/${r.id}`)}>Open</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/adjustments")} style={{ padding: 0, marginBottom: 4 }}>
        Back to Adjustments
      </Button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Stock Takes</Typography.Title>
          <Typography.Text type="secondary">Physical counts — variance posts as linked adjustments</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Stock Take</Button>
      </div>

      <Table
        dataSource={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: load }}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
      />

      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={create} confirmLoading={creating}
        title="New Stock Take" okText="Start & Snapshot">
        <Form form={form} layout="vertical">
          <Form.Item name="warehouseId" label="Warehouse" rules={[{ required: true }]}>
            <Select placeholder="Select warehouse" showSearch optionFilterProp="children">
              {warehouses.map((w) => <Option key={w.id} value={w.id}>{w.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="categoryId" label="Category (optional — limits the count)">
            <Select placeholder="All categories" allowClear showSearch optionFilterProp="children">
              {categories.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockTakePage;
