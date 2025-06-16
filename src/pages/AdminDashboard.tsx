import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css';
import Pagination from '../shared/components/Pagination';
import { formatDate } from '../shared/utils/dateUtils';
import { authFetch } from '../shared/utils/authFetch';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTable from '../admin/AdminTable';
import AdminModalForm from '../admin/AdminModalForm';
import AdminModal from '../admin/AdminModal';
import { AdminProvider, useAdmin } from '../admin/AdminContext';

// Configuración de modelos centralizada
const MODELS = {
  users: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Rol' },
    ],
    formFields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'password', label: 'Contraseña', required: true, type: 'password' },
      { key: 'role', label: 'Rol', required: true },
    ],
    endpoint: 'users',
    title: 'Usuarios',
  },
  fields: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
      { key: 'type', label: 'Tipo' },
      { key: 'description', label: 'Descripción' },
      { key: 'address', label: 'Dirección' },
      { key: 'location', label: 'Localidad' },
      { key: 'price_per_hour', label: 'Precio/hora' },
      { key: 'images', label: 'Imágenes' },
    ],
    formFields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'type', label: 'Tipo', required: true },
      { key: 'description', label: 'Descripción', required: true },
      { key: 'address', label: 'Dirección', required: true },
      { key: 'location', label: 'Localidad', required: true },
      { key: 'price_per_hour', label: 'Precio/hora', required: true, type: 'number' },
      { key: 'images', label: 'Imágenes (JSON)', required: false },
    ],
    endpoint: 'fields',
    title: 'Campos',
  },
  reservations: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'field_id', label: 'Campo' },
      { key: 'start_time', label: 'Inicio' },
      { key: 'slot', label: 'Slot' },
      { key: 'total_price', label: 'Precio' },
      { key: 'status', label: 'Estado' },
    ],
    formFields: [
      { key: 'field_id', label: 'Campo', required: true },
      { key: 'date', label: 'Fecha', required: true, type: 'date' },
      { key: 'slot', label: 'Slot', required: true },
      { key: 'total_price', label: 'Precio', required: true, type: 'number' },
    ],
    endpoint: 'reservations',
    title: 'Reservas',
  },
  payments: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'user_id', label: 'Usuario' },
      { key: 'type', label: 'Tipo' },
      { key: 'last4', label: 'Últimos 4' },
      { key: 'created_at', label: 'Creado' },
    ],
    formFields: [], // No edición/creac
    // ón
    endpoint: 'payments',
    title: 'Métodos de Pago',
    fetchUrl: '/api/payments/method/all',
    readOnly: true,
  },
};

const PAGE_SIZE = 10;

function AdminDashboardContent() {
  const { selectedModel } = useAdmin();
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Protección de ruta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch de datos SOLO cuando cambia el modelo o la página
  const fetchData = useCallback(async (model: string, page: number = 1) => {
    try {
      let url = `/api/${model}?page=${page}`;
      if (MODELS[model]?.fetchUrl) {
        url = `${MODELS[model].fetchUrl}?page=${page}&limit=${PAGE_SIZE}`;
      }
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const result = await response.json();
      const formattedData = result.data?.map((item: any) => {
        // Para campos, parsear imágenes si es JSON
        if (model === 'fields' && item.images && typeof item.images === 'string') {
          try {
            item.images = JSON.parse(item.images);
          } catch {}
        }
        return item;
      }) ?? [];
      setData(formattedData);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      setError('Error al cargar datos');
      setData([]);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page on model change
  }, [selectedModel]);

  useEffect(() => {
    fetchData(selectedModel, currentPage);
  }, [selectedModel, currentPage, fetchData]);

  const handleOpenModal = (item: any = null) => {
    setIsEditing(!!item);
    setModalData(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // Nuevo: abrir modal de confirmación antes de eliminar
  const handleAskDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    let model = selectedModel;
    if (model === 'payments') model = 'payment_methods';
    try {
      const response = await authFetch(
        `/api/${model}/${deleteId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Error al eliminar el registro');
      fetchData(selectedModel, currentPage);
    } catch (error) {
      setError('Error al eliminar el registro');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (formData: any) => {
    let model = selectedModel;
    if (model === 'payments') return; // No CRUD para métodos de pago
    try {
      // Validaciones básicas
      const fields = MODELS[selectedModel].formFields;
      for (const field of fields) {
        if (field.required && !formData[field.key]) {
          setError(`El campo '${field.label}' es obligatorio.`);
          return;
        }
      }
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/${model}/${modalData.id}`
        : `/api/${model}`;
      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al guardar los datos');
      fetchData(selectedModel, currentPage);
      handleCloseModal();
    } catch (error) {
      setError('Error al guardar los datos');
    }
  };

  // --- UI ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f4' }}>
      <AdminSidebar />
      <main
        className="dashboard-container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'transparent',
          padding: 0,
        }}
      >
        <h1 style={{ textAlign: 'center', marginTop: 0 }}>{MODELS[selectedModel].title}</h1>
        <button
          className="admin-modal-form-btn"
          style={{ marginBottom: 24, marginTop: 8 }}
          onClick={() => { setModalData(null); setIsEditing(false); setIsModalOpen(true); }}
        >
          Crear {MODELS[selectedModel].title.slice(0, -1)}
        </button>
        <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AdminTable
            columns={MODELS[selectedModel].columns}
            data={data}
            onEdit={row => handleOpenModal(row)}
            onDelete={row => handleAskDelete(row.id)}
            loading={false}
          />
          <div className="dashboard-pagination" style={{ margin: '24px 0 0 0' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        {/* Modal de confirmación de eliminar */}
        <AdminModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar registro">
          <div style={{ color: '#222', marginBottom: 28, fontSize: 16 }}>
            ¿Seguro que deseas eliminar este registro?
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              onClick={handleConfirmDelete}
              style={{
                background: '#113366',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 2.2rem',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30,42,60,0.08)',
                transition: 'background 0.2s',
              }}
            >Eliminar</button>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                background: '#fff',
                color: '#113366',
                border: '1.5px solid #113366',
                borderRadius: 8,
                padding: '0.7rem 2.2rem',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30,42,60,0.04)',
                transition: 'background 0.2s',
              }}
            >Cancelar</button>
          </div>
        </AdminModal>
        {/* Modal de edición/creación */}
        <AdminModal open={isModalOpen} onClose={handleCloseModal} title={isEditing ? `Editar ${MODELS[selectedModel].title.slice(0, -1)}` : `Crear ${MODELS[selectedModel].title.slice(0, -1)}`} width={420}>
          <AdminModalForm
            open={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={async values => {
              await handleSubmit(values);
              setIsModalOpen(false);
            }}
            initialValues={modalData || {}}
            fields={MODELS[selectedModel].formFields}
            title={undefined} // Elimina el título interno del formulario
          />
        </AdminModal>
      </main>
    </div>
  );
}

const AdminDashboard: React.FC = () => (
  <AdminProvider>
    <AdminDashboardContent />
  </AdminProvider>
);

export default AdminDashboard;