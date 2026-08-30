import React, { useEffect, useState } from "react";
import {
  Modal, Form, Radio, Input, InputNumber, DatePicker, Checkbox, Alert, Descriptions, message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useChequeStore } from "../../store/transactions/chequeStore";
import type {
  ChequeRegisterRow,
  ChequeSettlementMethod,
} from "../../types/entities/cheque.types";

interface Props {
  open: boolean;
  cheque: ChequeRegisterRow | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const rs = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ReturnChequeModal: React.FC<Props> = ({ open, cheque, onCancel, onSuccess }) => {
  const { processReturn, submitting, error, clearError } = useChequeStore();
  const [method, setMethod] = useState<ChequeSettlementMethod>("cheque");
  const [useNewDate, setUseNewDate] = useState(false);
  const [form] = Form.useForm();

  const face = cheque?.amount ?? 0;
  const hasSupplier = !!cheque?.supplierId;

  useEffect(() => {
    if (open) {
      clearError();
      setMethod("cheque");
      setUseNewDate(false);
      form.resetFields();
      form.setFieldsValue({ settlementAmount: face });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const submit = async () => {
    if (!cheque) return;
    const v = await form.validateFields();

    const payload: any = { settlementMethod: method, note: v.note?.trim() || undefined };
    if (method === "cheque") {
      payload.newChequeNumber = String(v.newChequeNumber).trim();
      payload.newChequeNote = v.newChequeNote?.trim() || undefined;
      payload.newChequeDate = useNewDate && v.newChequeDate
        ? (v.newChequeDate as Dayjs).format("YYYY-MM-DD")
        : null;
    } else if (method === "cash") {
      payload.settlementAmount = face;
    } else {
      payload.settlementAmount = Number(v.settlementAmount ?? 0);
    }

    try {
      await processReturn(cheque.grnId, payload);
      message.success("Cheque return processed");
      onSuccess();
    } catch {
      /* surfaced via effect */
    }
  };

  return (
    <Modal
      open={open}
      title="Process Returned Cheque"
      onCancel={onCancel}
      onOk={submit}
      okText="Process Return"
      confirmLoading={submitting}
      width={560}
    >
      {cheque && (
        <>
          <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Cheque No">{cheque.chequeNumber || "—"}</Descriptions.Item>
            <Descriptions.Item label="GRN">{cheque.grnNumber}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{cheque.supplierName || "—"}</Descriptions.Item>
            <Descriptions.Item label="Cheque Value">{rs(face)}</Descriptions.Item>
          </Descriptions>

          <Radio.Group
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="cheque">New Cheque</Radio.Button>
            <Radio.Button value="cash">Cash</Radio.Button>
            <Radio.Button value="credit" disabled={!hasSupplier}>Credit</Radio.Button>
          </Radio.Group>

          <Form form={form} layout="vertical">
            {method === "cheque" && (
              <>
                <Form.Item
                  name="newChequeNumber"
                  label="New Cheque Number"
                  rules={[
                    { required: true, message: "Enter the replacement cheque number" },
                    { pattern: /^\d+$/, message: "Digits only" },
                  ]}
                >
                  <Input placeholder="e.g. 004521" />
                </Form.Item>
                <Checkbox
                  checked={useNewDate}
                  onChange={(e) => setUseNewDate(e.target.checked)}
                  style={{ marginBottom: 8 }}
                >
                  Set a cheque date (post-dated defers payment to the supplier)
                </Checkbox>
                {useNewDate && (
                  <Form.Item
                    name="newChequeDate"
                    rules={[{ required: true, message: "Pick a date" }]}
                  >
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={(d) => d && d < dayjs().startOf("day")} />
                  </Form.Item>
                )}
                <Form.Item name="newChequeNote" label="Cheque Note">
                  <Input placeholder="Optional" />
                </Form.Item>
              </>
            )}

            {method === "cash" && (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message={`The full cheque value ${rs(face)} will be recorded as a cash payment.`}
              />
            )}

            {method === "credit" && (
              <>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Enter the amount paid now. The remainder is added to the supplier's credit balance."
                />
                <Form.Item
                  name="settlementAmount"
                  label="Amount paid now"
                  rules={[
                    {
                      validator: (_, val) =>
                        val >= 0 && val <= face
                          ? Promise.resolve()
                          : Promise.reject(new Error(`Between 0 and ${rs(face)}`)),
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} max={face} precision={2} addonBefore="Rs." />
                </Form.Item>
              </>
            )}

            <Form.Item name="note" label="Return Reason / Note">
              <Input.TextArea rows={2} placeholder="e.g. Cheque bounced — insufficient funds" />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ReturnChequeModal;
