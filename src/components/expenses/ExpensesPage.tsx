import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Button, Space, Typography, Modal, Form, Input, Select, InputNumber,
  DatePicker, message, Popconfirm, Tag,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  EyeOutlined, AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useExpenseStore } from "../../store/management/expenseStore";
import { useExpenseCategoryStore } from "../../store/management/expenseCategoryStore";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { Expense, ExpenseFormData } from "../../types/entities/expense.types";

const { RangePicker } = DatePicker;

const rs = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const titleCase = (s: string) =>
  s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    expenses, loading, submitting, pagination, totalAmount, error,
    getExpenses, createExpense, updateExpense, deleteExpense, clearError,
  } = useExpenseStore();
  const { allCategories, getAllCategories } = useExpenseCategoryStore();
  const { allWarehouses, getAllWarehouses } = useWarehouseStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form] = Form.useForm();
  const titleValue = Form.useWatch("title", form);
  const amountValue = Form.useWatch("amount", form);

  const load = () =>
    getExpenses({
      page,
      limit: 10,
      search: debouncedSearch,
      categoryId: categoryFilter,
      from: range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
      to: range?.[1] ? range[1].format("YYYY-MM-DD") : undefined,
    });

  useEffect(() => {
    getAllCategories();
    getAllWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, categoryFilter, range]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ expenseDate: dayjs() });
    setModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    form.setFieldsValue({
      title: e.title,
      categoryId: e.categoryId,
      warehouseId: e.warehouseId,
      amount: e.amount,
      note: e.note,
      expenseDate: dayjs(e.expenseDate),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const payload: ExpenseFormData = {
      title: titleCase(v.title),
      categoryId: v.categoryId ?? null,
      warehouseId: v.warehouseId ?? null,
      amount: Number(v.amount),
      note: v.note?.trim() || undefined,
      expenseDate: (v.expenseDate as Dayjs).format("YYYY-MM-DD"),
    };
    try {
      if (editing) {
        await updateExpense(editing.id, payload);
        message.success("Expense updated");
      } else {
        await createExpense(payload);
        message.success("Expense recorded");
      }
      setModalOpen(false);
      load();
    } catch {
      /* surfaced via store effect */
    }
  };

  const remove = async (e: Expense) => {
    try {
      await deleteExpense(e.id);
      message.success("Expense deleted");
      load();
    } catch {
      /* surfaced via store effect */
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "expenseDate",
        key: "expenseDate",
        width: 120,
        render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
      },
      { title: "Title", dataIndex: "title", key: "title" },
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "categoryName",
        render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
      },
      {
        title: "Warehouse",
        dataIndex: "warehouseName",
        key: "warehouseName",
        render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right" as const,
        render: (v: number) => rs(v),
      },
      {
        title: "Actions",
        key: "actions",
        align: "center" as const,
        width: 130,
        render: (_: unknown, e: Expense) => (
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(e)} />
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(e)} />
            <Popconfirm title={`Delete "${e.title}"?`} onConfirm={() => remove(e)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Expenses
        </Typography.Title>
        <div style={{ flex: 1 }} />
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: "4px 10px" }}>
            Total: {rs(totalAmount)}
          </Tag>
          <Button icon={<AppstoreOutlined />} onClick={() => navigate("/expense-categories")}>
            Categories
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Expense
          </Button>
        </Space>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Search by title"
          allowClear
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 260 }}
        />
        <Select
          placeholder="All categories"
          allowClear
          value={categoryFilter}
          onChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
          style={{ minWidth: 200 }}
          options={allCategories.map((c) => ({ label: c.name, value: c.id }))}
        />
        <RangePicker
          value={range as any}
          onChange={(v) => {
            setRange(v as [Dayjs, Dayjs] | null);
            setPage(1);
          }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearch("");
            setCategoryFilter(undefined);
            setRange(null);
            setPage(1);
          }}
        >
          Refresh
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={expenses}
        columns={columns}
        loading={loading}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Edit Expense" : "New Expense"}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        okText={editing ? "Update" : "Save"}
        confirmLoading={submitting}
        okButtonProps={{
          disabled:
            !titleValue ||
            titleValue.trim().length < 2 ||
            !amountValue ||
            Number(amountValue) <= 0,
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Title is required" },
              { min: 2, message: "At least 2 characters" },
              { max: 200, message: "At most 200 characters" },
            ]}
          >
            <Input placeholder="e.g. Monthly Electricity Bill" autoFocus />
          </Form.Item>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item name="categoryId" label="Category" style={{ flex: 1, minWidth: 180 }}>
              <Select
                allowClear
                placeholder="Select category"
                options={allCategories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
            <Form.Item name="warehouseId" label="Warehouse" style={{ flex: 1, minWidth: 180 }}>
              <Select
                allowClear
                placeholder="Select warehouse"
                options={allWarehouses.map((w) => ({ label: w.name, value: w.id }))}
              />
            </Form.Item>
          </Space>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item
              name="amount"
              label="Amount"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: "Amount is required" },
                {
                  validator: (_, value) =>
                    value > 0 ? Promise.resolve() : Promise.reject(new Error("Must be greater than 0")),
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                precision={2}
                addonBefore="Rs."
                placeholder="0.00"
              />
            </Form.Item>
            <Form.Item
              name="expenseDate"
              label="Date"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Space>

          <Form.Item name="note" label="Details">
            <Input.TextArea rows={2} maxLength={1000} placeholder="Optional" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!viewing}
        title="Expense Details"
        footer={null}
        onCancel={() => setViewing(null)}
      >
        {viewing && (
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <div><b>Title:</b> {viewing.title}</div>
            <div><b>Date:</b> {dayjs(viewing.expenseDate).format("YYYY-MM-DD")}</div>
            <div><b>Category:</b> {viewing.categoryName || "—"}</div>
            <div><b>Warehouse:</b> {viewing.warehouseName || "—"}</div>
            <div><b>Amount:</b> {rs(viewing.amount)}</div>
            <div><b>Details:</b> {viewing.note || "—"}</div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ExpensesPage;
