import { useState } from 'react';
import './dashboard.css';
import Pagination from '../shared/components/Pagination';

function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModel, setSelectedModel] = useState('');
  const [totalPages, setTotalPages] = useState(1); // Estado para el total de páginas

  const fetchData = async (model: string, page: number = 1) => {
    try {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage
      const response = await fetch(
        `http://localhost:3000/api/${model}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
          },
        }
      );
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const result = await response.json();
      setData(result.data || result); // Ajustar según la estructura de la respuesta
      setTotalPages(result.totalPages || 10); // Actualizar el total de páginas
      setSelectedModel(model);
      setCurrentPage(page); // Reiniciar la página actual
    } catch (error) {
      console.error(error);
    }
  };

  const handleModelChange = (model: string) => {
    fetchData(model, 1); // Reiniciar a la primera página al cambiar de modelo
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <h1>Dashboard de Administrador</h1>
        <nav>
          <button onClick={() => handleModelChange('users')}>Usuarios</button>
          <button onClick={() => handleModelChange('fields')}>Campos</button>
          <button onClick={() => handleModelChange('reservations')}>Reservas</button>
          <button onClick={() => handleModelChange('payments')}>Pagos</button>
        </nav>
        {data.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="dashboard-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages} // Usar el total dinámico
                onPageChange={(page) => {
                  setCurrentPage(page);
                  fetchData(selectedModel, page);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;