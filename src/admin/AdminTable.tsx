import React from "react";
import './AdminTable.css';

interface AdminTableProps<T> {
  columns: { key: keyof T; label: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onDetail?: (row: T) => void;
  loading?: boolean;
}

function AdminTable<T extends { id: number | string }>({ columns, data, onEdit, onDelete, onDetail, loading }: AdminTableProps<T>) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
            {(onEdit || onDelete || onDetail) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1}>Cargando...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length + 1}>Sin resultados</td></tr>
          ) : (
            data.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={String(col.key)}>{col.render ? col.render(row) : (row[col.key] as any)}</td>
                ))}
                {(onEdit || onDelete || onDetail) && (
                  <td className="admin-table-actions">
                    {onDetail && <button className="action-btn detail" onClick={() => onDetail(row)} aria-label="Ver detalle">👁️</button>}
                    {onEdit && <button className="action-btn edit" onClick={() => onEdit(row)} aria-label="Editar">✏️</button>}
                    {onDelete && <button className="action-btn delete" onClick={() => onDelete(row)} aria-label="Eliminar">🗑️</button>}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
