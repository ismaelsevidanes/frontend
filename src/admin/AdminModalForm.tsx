import React, { useState, useEffect } from "react";
import './AdminModalForm.css';

interface AdminModalFormProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<T>) => void;
  initialValues?: Partial<T>;
  fields: { key: keyof T; label: string; type?: string; required?: boolean }[];
  title: string;
}

function AdminModalForm<T>({ open, onClose, onSubmit, initialValues, fields, title }: AdminModalFormProps<T>) {
  const [values, setValues] = useState<Partial<T>>(initialValues || {});
  useEffect(() => { setValues(initialValues || {}); }, [initialValues, open]);
  if (!open) return null;
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal-content">
        <h3>{title}</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(values); }}>
          {fields.map(f => (
            <div key={String(f.key)} className="admin-modal-field">
              <label htmlFor={String(f.key)}>{f.label}</label>
              <input
                id={String(f.key)}
                type={f.type || "text"}
                value={values[f.key] as any || ""}
                required={f.required}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="admin-modal-actions">
            <button className="admin-modal-form-btn" type="submit">Guardar</button>
            <button className="admin-modal-form-btn cancel" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminModalForm;
