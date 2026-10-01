import React, { useState } from 'react';
import { Modal } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import WarrantyLookup from './WarrantyLookup';
import RegistrationModal from './RegistrationModal';
import { usePermission } from '../../contexts/PermissionContext';
import { PERMISSIONS } from '../../types/auth/permissions';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Counter-side warranty check (opened from the POS): look a sale up by invoice / serial and see the cover. */
const WarrantyLookupModal: React.FC<Props> = ({ open, onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        destroyOnHidden
        title={<span><SafetyCertificateOutlined style={{ marginRight: 8 }} />Warranty Check</span>}
      >
        <WarrantyLookup autoFocus onSelect={(r) => setSelected(r.id)} />
        {hasPermission(PERMISSIONS.WARRANTIES_CLAIMS) && (
          <div className="mt-3 text-right">
            <a onClick={() => { onClose(); navigate('/warranty-claims'); }}>Open warranty claims →</a>
          </div>
        )}
      </Modal>
      <RegistrationModal registrationId={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default WarrantyLookupModal;
