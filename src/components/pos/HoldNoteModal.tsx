import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';

interface HoldNoteModalProps {
  open: boolean;
  submitting: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

const HoldNoteModal: React.FC<HoldNoteModalProps> = ({ open, submitting, onConfirm, onCancel }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  return (
    <Modal
      title="Hold Bill"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>,
        <Button
          key="hold"
          type="primary"
          loading={submitting}
          onClick={() => onConfirm(notes.trim())}
          style={{ backgroundColor: '#ffaf40', borderColor: '#ffaf40' }}
        >
          Hold Bill
        </Button>,
      ]}
      width={420}
      destroyOnClose
    >
      <div className="py-3">
        <p className="text-sm text-gray-500 mb-3">
          Enter an optional label to identify this held bill (e.g. "Table 5 – Ruchira").
        </p>
        <Input
          placeholder="Hold note / label (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={100}
          autoFocus
          onPressEnter={() => !submitting && onConfirm(notes.trim())}
          showCount
        />
      </div>
    </Modal>
  );
};

export default HoldNoteModal;
