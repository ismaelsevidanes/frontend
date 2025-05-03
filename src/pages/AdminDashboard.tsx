import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Pagination from '../shared/components/Pagination';
import Modal from '../shared/components/Modal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDate } from '../shared/utils/dateUtils';

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

  useEffect(() => {
    if (selectedModel) {
      fetchData(selectedModel, currentPage);
    }
  }, [selectedModel, currentPage]);

  const fetchData = async (model: string, page: number = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/${model}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/${selectedModel}/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `http://localhost:3000/api/${selectedModel}/${modalData.id}`
        : `http://localhost:3000/api/${selectedModel}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
                      <td key={i}>{value}</td>
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
            try {
              const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement));
              await handleSubmit(formData);
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
                        pattern={
                          key === 'email'
                            ? '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' // Validación de email
                            : key === 'password'
                            ? '.{6,}' // Validación de contraseña
                            : undefined
                        }
                        title={
                          key === 'email'
                            ? 'Debe ser un email válido.'
                            : key === 'password'
                            ? 'La contraseña debe tener al menos 6 caracteres.'
                            : undefined
                        }
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