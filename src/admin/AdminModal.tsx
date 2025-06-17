import React from 'react';
import './AdminModal.css';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
}

const AdminModal: React.FC<AdminModalProps> = ({ open, onClose, title, children, width = 400 }) => {
  if (!open) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box" style={{ minWidth: width }}>
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="admin-modal-close"
        >×</button>
        {title && <h2 className="admin-modal-title">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AdminModal;
