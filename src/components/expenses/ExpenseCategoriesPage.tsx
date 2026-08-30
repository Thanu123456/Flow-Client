import React, { useEffect, useState } from "react";
import {
  Table, Button, Tag, Space, Typography, Modal, Form, Input, Switch,
  message, Popconfirm, Tooltip,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useExpenseCategoryStore } from "../../store/management/expenseCategoryStore";
import type {
  ExpenseCategory,
  ExpenseCategoryFormData,
} from "../../types/entities/expense.types";

/** Title-case each word — mirrors the desktop POS CapitalizeName helper. */
const titleCase = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

const ExpenseCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    categories, loading, submitting, pagination, error,
    getCategories, createCategory, updateCategory, deleteCategory, clearError,
  } = useExpenseCategoryStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [form] = Form.useForm();
  const nameValue = Form.useWatch("name", form);

  const load = () =>
    getCategories({ page, limit: 10, search: debouncedSearch, status: undefined });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setModalOpen(true);
  };

  const openEdit = (c: ExpenseCategory) => {
    setEditing(c);
    form.setFieldsValue({
      name: c.name,
      description: c.description,
      status: c.status === "active",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const payload: ExpenseCategoryFormData = {
      name: titleCase(v.name),
      description: v.description?.trim() || undefined,
      status: v.status ? "active" : "inactive",
    };
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        message.success("Expense category updated");
      } else {
        await createCategory(payload);
        message.success("Expense category created");
      }
      setModalOpen(false);
      load();
    } catch {
      /* error surfaced via store effect */
    }
  };

  const remove = async (c: ExpenseCategory) => {
    try {
      await deleteCategory(c.id);
      message.success("Expense category deleted");
      load();
    } catch {
      /* error surfaced via store effect */
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Expenses",
      dataIndex: "expenseCount",
      key: "expenseCount",
      align: "center" as const,
      render: (v: number) => <Tag color={v > 0 ? "blue" : "default"}>{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (v: string) =>
        v === "active" ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: unknown, c: ExpenseCategory) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(c)} />
          <Tooltip
            title={c.expenseCount > 0 ? "Category has expenses — deactivate instead" : "Delete"}
          >
            <Popconfirm
              title={`Delete "${c.name}"?`}
              onConfirm={() => remove(c)}
              disabled={c.expenseCount > 0}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={c.expenseCount > 0}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/expenses")}
        style={{ padding: 0, marginBottom: 4 }}
      >
        Back to Expenses
      </Button>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Expense Categories
      </Typography.Title>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Input.Search
          placeholder="Search by name"
          allowClear
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 320 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setPage(1); load(); }}>
          Refresh
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New Category
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={categories}
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
        title={editing ? "Edit Expense Category" : "New Expense Category"}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        okText={editing ? "Update" : "Create"}
        confirmLoading={submitting}
        okButtonProps={{ disabled: !nameValue || nameValue.trim().length < 2 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: "Category name is required" },
              { min: 2, message: "At least 2 characters" },
              { max: 100, message: "At most 100 characters" },
            ]}
          >
            <Input placeholder="e.g. Rent, Utilities, Salaries" autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} maxLength={500} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="status" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseCategoriesPage;
