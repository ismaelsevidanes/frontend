import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Pagination from '../shared/components/Pagination';
import Modal from '../shared/components/Modal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDate } from '../shared/utils/dateUtils';
import { authFetch } from '../shared/utils/authFetch';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModel, setSelectedModel] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (selectedModel) {
      fetchData(selectedModel, currentPage);
    }
  }, [selectedModel, currentPage]);

  const fetchData = async (model: string, page: number = 1) => {
    try {
      const response = await authFetch(
        `/api/${model}?page=${page}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const result = await response.json();

      // Format specific date fields before setting data
      const formattedData = result.data.map((item: any) => {
        const formattedItem = { ...item };
        ['paid_at', 'start_time', 'end_time'].forEach((key) => {
          if (formattedItem[key]) {
            formattedItem[key] = formatDate(formattedItem[key]);
          }
        });
        return formattedItem;
      });

      setData(formattedData || result);
      setTotalPages(result.totalPages || 10);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setCurrentPage(1);
  };

  const handleOpenModal = (item: any = null) => {
    setIsEditing(!!item);
    setModalData(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        const response = await authFetch(
          `/api/${selectedModel}/${id}`,
          {
            method: 'DELETE',
          }
        );
        if (!response.ok) {
          throw new Error('Error al eliminar el registro');
        }
        fetchData(selectedModel, currentPage);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/${selectedModel}/${modalData.id}`
        : `/api/${selectedModel}`;
      const response = await authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }
      fetchData(selectedModel, currentPage);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  function validateField(key: string, value: string) {
    if (key === 'email') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Debe ser un email válido.';
    }
    if (key === 'password') {
      if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (!/[A-Z]/.test(value)) return 'Debe tener al menos una mayúscula.';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Debe tener al menos un símbolo.';
    }
    if (key === 'name' && !value.trim()) return 'El nombre es obligatorio.';
    if (key === 'price_per_hour' && (isNaN(Number(value)) || Number(value) < 1)) return 'El precio debe ser mayor que 0.';
    if (key === 'amount' && (isNaN(Number(value)) || Number(value) < 0.01)) return 'El monto debe ser mayor que 0.';
    if (key === 'reservation_id' && (!value || isNaN(Number(value)) || Number(value) < 1)) return 'Reserva inválida.';
    if (key === 'field_id' && (!value || isNaN(Number(value)) || Number(value) < 1)) return 'Campo inválido.';
    if (key === 'user_ids' && (!value || value.split(',').length < 1)) return 'Debe haber al menos un usuario.';
    if (key === 'start_time' && !value) return 'La fecha/hora de inicio es obligatoria.';
    if (key === 'end_time' && !value) return 'La fecha/hora de fin es obligatoria.';
    if (key === 'paid_at' && !value) return 'La fecha de pago es obligatoria.';
    if (key === 'payment_method' && !value) return 'El método de pago es obligatorio.';
    if (key === 'type' && value && !['futbol7','futbol11'].includes(value)) return 'Tipo inválido.';
    if (key === 'role' && value && !['user','admin'].includes(value)) return 'Rol inválido.';
    return '';
  }

  return (
    <main className="dashboard-container">
      <div className="container">
        <h1>Dashboard de Administrador</h1>
        <nav className="dashboard-nav">
          <button onClick={() => handleModelChange('users')}>Usuarios</button>
          <button onClick={() => handleModelChange('fields')}>Campos</button>
          <button onClick={() => handleModelChange('reservations')}>Reservas</button>
          <button onClick={() => handleModelChange('payments')}>Pagos</button>
        </nav>
        {data.length > 0 ? (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                    <td>
                      <button onClick={() => handleOpenModal(item)}>Editar</button>
                      <button className="delete" onClick={() => handleDelete(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="dashboard-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        ) : (
          <p>Selecciona una categoría para ver los datos.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2>Modificar Datos</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            const formDataObj = Object.fromEntries(new FormData(e.target as HTMLFormElement));
            // Validación frontend antes de enviar
            for (const key of Object.keys(formDataObj)) {
              const err = validateField(key, formDataObj[key]);
              if (err) {
                setError(err);
                return;
              }
            }
            try {
              await handleSubmit(formDataObj);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error desconocido');
            }
          }}
        >
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {modalData &&
            Object.keys(data[0] || {})
              .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
              .map((key) => (
                <div key={key} style={{ position: 'relative' }}>
                  <label>{key}:</label>
                  {key === 'role' ? (
                    <select
                      name="role"
                      defaultValue={modalData[key]}
                      style={{ backgroundColor: '#fff', color: '#000' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <>
                      <input
                        name={key}
                        type={key === 'password' && !showPassword ? 'password' : 'text'}
                        defaultValue={modalData[key] || ''}
                        style={{ backgroundColor: '#fff', color: '#888', paddingRight: '2rem' }}
                        required={key === 'name' || key === 'email' || key === 'password'}
                        onBlur={e => {
                          const err = validateField(key, e.target.value);
                          if (err) setError(err);
                        }}
                      />
                      {key === 'password' && (
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
          <button type="submit">Guardar</button>
        </form>
      </Modal>
    </main>
  );
}

export default AdminDashboard;