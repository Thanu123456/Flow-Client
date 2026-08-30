import React, { useState } from "react";
import {
  Modal, Descriptions, Table, Tag, Badge, Space, Typography, Divider,
  Upload, Button, message, Popconfirm, Alert,
} from "antd";
import {
  ArrowUpOutlined, ArrowDownOutlined, UploadOutlined, DeleteOutlined,
  PaperClipOutlined, PrinterOutlined, CheckOutlined, CloseOutlined, RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStockAdjustmentStore } from "../../store/inventory/stockAdjustmentStore";
import { stockAdjustmentService } from "../../services/inventory/stockAdjustmentService";
import { usePermissions } from "../../hooks/auth/usePermissions";
import { PERMISSIONS } from "../../types/auth/permissions";
import { STATUS_META, SOURCE_LABELS, REFERENCE_LABELS } from "./adjustmentMeta";
import type { AdjustmentItem, JournalEntry } from "../../types/entities/stockAdjustment.types";

const money = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const readAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

const StockAdjustmentDetailsModal: React.FC<Props> = ({ open, onClose, onChanged }) => {
  const { selectedAdjustment, loading, getAdjustment, approveAdjustment, rejectAdjustment, reverseAdjustment, submitting } =
    useStockAdjustmentStore();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.INVENTORY_ADJUST_APPROVE);
  const adj = selectedAdjustment;
  const [uploading, setUploading] = useState(false);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  React.useEffect(() => {
    if (adj?.id) {
      stockAdjustmentService.getJournal(adj.id).then(setJournal).catch(() => setJournal([]));
    }
  }, [adj?.id, adj?.status]);

  const refresh = async () => {
    if (adj) await getAdjustment(adj.id);
    onChanged?.();
  };

  const handleUpload = async (file: File) => {
    const okType = /^(image\/|application\/pdf)/.test(file.type);
    if (!okType) { message.error("Only images and PDF files are allowed"); return Upload.LIST_IGNORE; }
    if (file.size > 10 * 1024 * 1024) { message.error("File must be under 10 MB"); return Upload.LIST_IGNORE; }
    setUploading(true);
    try {
      const data = await readAsBase64(file);
      await stockAdjustmentService.addAttachment(adj!.id, { file_name: file.name, content_type: file.type, data });
      message.success("Attachment added");
      await refresh();
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const handleDeleteAttachment = async (attId: string) => {
    try {
      await stockAdjustmentService.deleteAttachment(adj!.id, attId);
      message.success("Attachment removed");
      await refresh();
    } catch (e: any) {
      message.error(e?.message ?? "Failed to remove");
    }
  };

  const handleApprove = async () => {
    try { await approveAdjustment(adj!.id); message.success("Approved & posted"); onChanged?.(); }
    catch (e: any) { message.error(e?.message ?? "Failed"); }
  };

  const handleReject = () => {
    let reason = "";
    Modal.confirm({
      title: "Reject this adjustment?",
      content: <Typography.Paragraph><textarea style={{ width: "100%" }} rows={3} onChange={(e) => { reason = e.target.value; }} placeholder="Reason (required)" /></Typography.Paragraph>,
      okButtonProps: { danger: true }, okText: "Reject",
      onOk: async () => {
        if (!reason.trim()) { message.error("Reason required"); return Promise.reject(); }
        await rejectAdjustment(adj!.id, reason.trim());
        message.success("Rejected"); onChanged?.();
      },
    });
  };

  const handleReverse = () => {
    Modal.confirm({
      title: `Reverse ${adj!.adjustmentNumber}?`,
      content: "An equal-and-opposite adjustment will be posted and linked.",
      okText: "Post Reversal",
      onOk: async () => {
        try {
          const rev = await reverseAdjustment(adj!.id, undefined);
          message.success(`Reversal ${rev.adjustmentNumber} posted`);
          onChanged?.();
          onClose();
        } catch (e: any) { message.error(e?.message ?? "Failed"); return Promise.reject(); }
      },
    });
  };

  const handlePrint = () => {
    if (!adj) return;
    const rows = adj.items.map((it) =>
      `<tr><td>${it.productName}${it.variationType ? ` (${it.variationType})` : ""}</td><td>${it.warehouseName}</td>` +
      `<td style="text-align:right">${adj.movementType === "in" ? "+" : "-"}${it.quantity} ${it.unitName ?? ""}</td>` +
      `<td style="text-align:right">${money(it.unitCost)}</td><td style="text-align:right">${money(it.lineTotal)}</td></tr>`
    ).join("");
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`
      <html><head><title>${adj.adjustmentNumber}</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;color:#111}
      h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:6px 8px;font-size:13px}th{background:#f5f5f5;text-align:left}
      .meta{font-size:13px;color:#444;line-height:1.7}</style></head><body>
      <h1>Stock Adjustment ${adj.adjustmentNumber}</h1>
      <div class="meta">
        Movement: <b>${adj.movementType === "in" ? "Stock In" : "Stock Out"}</b><br/>
        Reference: ${REFERENCE_LABELS[adj.referenceType] ?? adj.referenceType}${adj.reasonLabel ? ` · ${adj.reasonLabel}` : ""}<br/>
        Status: ${STATUS_META[adj.status]?.label ?? adj.status}<br/>
        Reason: ${adj.reason ?? "—"}<br/>
        Created by: ${adj.createdByName ?? "—"} on ${dayjs(adj.createdAt).format("YYYY-MM-DD HH:mm")}<br/>
        ${adj.approvedByName ? `Approved by: ${adj.approvedByName}<br/>` : ""}
        Total value: <b>${money(adj.totalAmount)}</b>
      </div>
      <table><thead><tr><th>Product</th><th>Warehouse</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit Cost</th><th style="text-align:right">Line Value</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print()}</script>
      </body></html>`);
    w.document.close();
  };

  const itemColumns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, row: AdjustmentItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productName}</div>
          {row.variationType && <Tag style={{ marginTop: 2 }}>{row.variationType}</Tag>}
          {row.productSKU && <span style={{ color: "#9ca3af", fontSize: 12 }}>{row.productSKU}</span>}
        </div>
      ),
    },
    { title: "Warehouse", dataIndex: "warehouseName", key: "warehouse" },
    {
      title: "Quantity",
      key: "quantity",
      align: "center" as const,
      render: (_: any, row: AdjustmentItem) => (
        <Tag color={adj?.movementType === "in" ? "green" : "red"}>
          {adj?.movementType === "in" ? "+" : "-"}{row.quantity} {row.unitName ?? ""}
        </Tag>
      ),
    },
    { title: "Unit Cost", dataIndex: "unitCost", key: "unitCost", align: "right" as const, render: (v: number) => money(v || 0) },
    { title: "Line Value", dataIndex: "lineTotal", key: "lineTotal", align: "right" as const, render: (v: number) => <strong>{money(v || 0)}</strong> },
    ...(adj?.movementType === "in"
      ? [{
          title: "Expiry", dataIndex: "expiryDate", key: "expiryDate", align: "center" as const,
          render: (v: string | undefined) => (v ? dayjs(v).format("YYYY-MM-DD") : <span style={{ color: "#9ca3af" }}>—</span>),
        }]
      : []),
    { title: "Reason", dataIndex: "reason", key: "reason", render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span> },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={820}
      title={
        <Space>
          {adj?.movementType === "in" ? (
            <Tag color="green" icon={<ArrowUpOutlined />}>Stock In</Tag>
          ) : (
            <Tag color="red" icon={<ArrowDownOutlined />}>Stock Out</Tag>
          )}
          <Typography.Text strong style={{ fontSize: 15 }}>{adj?.adjustmentNumber ?? "Adjustment Details"}</Typography.Text>
          {adj && <Tag color={STATUS_META[adj.status]?.color}>{STATUS_META[adj.status]?.label}</Tag>}
        </Space>
      }
      footer={
        adj ? (
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>
            {adj.status === "pending_approval" && canApprove && (
              <>
                <Button danger icon={<CloseOutlined />} onClick={handleReject}>Reject</Button>
                <Popconfirm title="Approve and post?" onConfirm={handleApprove} okText="Approve">
                  <Button type="primary" icon={<CheckOutlined />} loading={submitting}>Approve & Post</Button>
                </Popconfirm>
              </>
            )}
            {adj.status === "posted" && adj.sourceType !== "reversal" && !adj.reversedById && (
              <Button icon={<RollbackOutlined />} onClick={handleReverse}>Reverse</Button>
            )}
          </Space>
        ) : null
      }
      styles={{ body: { paddingTop: 8 } }}
    >
      {loading || !adj ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>Loading...</div>
      ) : (
        <>
          {adj.status === "rejected" && adj.rejectionReason && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }}
              message="Rejected" description={adj.rejectionReason} />
          )}
          {adj.reversedById && (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }}
              message="This adjustment was reversed" description="A linked reversal adjustment undid its stock effect." />
          )}
          {adj.reversesId && (
            <Alert type="info" showIcon style={{ marginBottom: 12 }}
              message="This is a reversal" description="It posts the opposite of an earlier adjustment." />
          )}

          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Adjustment No.">
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{adj.adjustmentNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Source">{SOURCE_LABELS[adj.sourceType] ?? adj.sourceType}</Descriptions.Item>
            <Descriptions.Item label="Reference Type">
              <Tag>{REFERENCE_LABELS[adj.referenceType] ?? adj.referenceType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reason Code">
              {adj.reasonLabel || <span style={{ color: "#9ca3af" }}>—</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              {adj.movementType === "in" && adj.priority ? (
                <Badge color={adj.priority === "high" ? "#ef4444" : "#6366f1"}
                  text={<span style={{ fontWeight: 600, color: adj.priority === "high" ? "#ef4444" : "#6366f1" }}>{adj.priority.toUpperCase()}</span>} />
              ) : <span style={{ color: "#9ca3af" }}>N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Total Value">
              <strong>{money(adj.totalAmount || 0)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Reason" span={2}>
              {adj.reason || <span style={{ color: "#9ca3af" }}>—</span>}
            </Descriptions.Item>
            {adj.notes && <Descriptions.Item label="Notes" span={2}>{adj.notes}</Descriptions.Item>}
            <Descriptions.Item label="Created By">{adj.createdByName || "—"}</Descriptions.Item>
            <Descriptions.Item label="Date">{dayjs(adj.createdAt).format("YYYY-MM-DD HH:mm")}</Descriptions.Item>
            {adj.approvedByName && (
              <>
                <Descriptions.Item label="Approved By">{adj.approvedByName}</Descriptions.Item>
                <Descriptions.Item label="Approved At">{adj.approvedAt ? dayjs(adj.approvedAt).format("YYYY-MM-DD HH:mm") : "—"}</Descriptions.Item>
              </>
            )}
          </Descriptions>

          <Divider style={{ margin: "12px 0" }}>Items ({adj.itemCount})</Divider>
          <Table dataSource={adj.items} columns={itemColumns} rowKey="id" pagination={false} size="small" />

          <Divider style={{ margin: "16px 0 12px" }}>
            <Space><PaperClipOutlined /> Attachments ({adj.attachments.length})</Space>
          </Divider>
          <Space direction="vertical" style={{ width: "100%" }}>
            {adj.attachments.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <a href={a.fileUrl} target="_blank" rel="noreferrer">{a.fileName}</a>
                <Popconfirm title="Remove this attachment?" onConfirm={() => handleDeleteAttachment(a.id)}>
                  <Button size="small" danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ))}
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*,application/pdf">
              <Button size="small" icon={<UploadOutlined />} loading={uploading}>Add photo / document</Button>
            </Upload>
          </Space>

          {journal.length > 0 && (
            <>
              <Divider style={{ margin: "16px 0 12px" }}>Journal Entries</Divider>
              {journal.map((je) => {
                const totDr = je.lines.reduce((s, l) => s + parseFloat(l.debit || "0"), 0);
                return (
                  <div key={je.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                      <code>{je.entryNumber}</code> · {je.entryDate}
                      {je.reversesEntryId && <Tag color="orange" style={{ marginLeft: 6 }}>reversing</Tag>}
                      {je.reversedByEntryId && <Tag style={{ marginLeft: 6 }}>reversed</Tag>}
                    </div>
                    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>
                          <th style={{ textAlign: "left", padding: "4px 6px" }}>Account</th>
                          <th style={{ textAlign: "right", padding: "4px 6px" }}>Debit</th>
                          <th style={{ textAlign: "right", padding: "4px 6px" }}>Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {je.lines.map((l, i) => (
                          <tr key={i}>
                            <td style={{ padding: "4px 6px" }}>{l.accountCode} — {l.accountName}</td>
                            <td style={{ textAlign: "right", padding: "4px 6px" }}>{parseFloat(l.debit) > 0 ? money(parseFloat(l.debit)) : ""}</td>
                            <td style={{ textAlign: "right", padding: "4px 6px" }}>{parseFloat(l.credit) > 0 ? money(parseFloat(l.credit)) : ""}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "1px solid #e5e7eb", fontWeight: 600 }}>
                          <td style={{ padding: "4px 6px" }}>Balanced</td>
                          <td style={{ textAlign: "right", padding: "4px 6px" }}>{money(totDr)}</td>
                          <td style={{ textAlign: "right", padding: "4px 6px" }}>{money(totDr)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default StockAdjustmentDetailsModal;
