import React from "react";
import "./ReservationFilters.css";
import { FaFilter } from "react-icons/fa";

export interface ReservationFiltersProps {
  precioMin: string;
  setPrecioMin: (v: string) => void;
  precioMax: string;
  setPrecioMax: (v: string) => void;
  ubicacion: string;
  setUbicacion: (v: string) => void;
  localidad: string;
  setLocalidad: (v: string) => void;
  ordenarPorFecha: boolean;
  setOrdenarPorFecha: (v: boolean) => void;
  numReservasMin: string;
  setNumReservasMin: (v: string) => void;
  numReservasMax: string;
  setNumReservasMax: (v: string) => void;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
}

const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  ubicacion,
  setUbicacion,
  localidad,
  setLocalidad,
  ordenarPorFecha,
  setOrdenarPorFecha,
  numReservasMin,
  setNumReservasMin,
  numReservasMax,
  setNumReservasMax,
  filtersOpen,
  setFiltersOpen
}) => (
  <div className="dashboard-filters-wrapper">
    <button className="dashboard-filters-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-label="Mostrar/ocultar filtros">
      <FaFilter style={{ marginRight: 8, fontSize: 20 }} />
      <span>Filtros</span>
    </button>
    {filtersOpen && (
      <div className="dashboard-filters">
        <div className="dashboard-filters-row">
          <input
            type="number"
            placeholder="Precio mínimo (€)"
            value={precioMin}
            onChange={e => setPrecioMin(e.target.value)}
            min={0}
            aria-label="Filtrar por precio mínimo"
          />
          <input
            type="number"
            placeholder="Precio máximo (€)"
            value={precioMax}
            onChange={e => setPrecioMax(e.target.value)}
            min={0}
            aria-label="Filtrar por precio máximo"
          />
          <input
            type="text"
            placeholder="Ubicación o nombre campo"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            aria-label="Filtrar por ubicación o nombre"
          />
          <input
            type="text"
            placeholder="Localidad"
            value={localidad}
            onChange={e => setLocalidad(e.target.value)}
            aria-label="Filtrar por localidad"
          />
          <input
            type="number"
            placeholder="Mín. reservas"
            value={numReservasMin}
            onChange={e => setNumReservasMin(e.target.value)}
            min={0}
            aria-label="Filtrar por mínimo de reservas"
          />
          <input
            type="number"
            placeholder="Máx. reservas"
            value={numReservasMax}
            onChange={e => setNumReservasMax(e.target.value)}
            min={0}
            aria-label="Filtrar por máximo de reservas"
          />
        </div>
        <div className="dashboard-checkbox-row">
          <label style={{ fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={ordenarPorFecha}
              onChange={e => setOrdenarPorFecha(e.target.checked)}
              style={{ accentColor: '#003366', marginRight: 8 }}
            />
            Ordenar por fecha más cercana
          </label>
        </div>
      </div>
    )}
  </div>
);

export default ReservationFilters;
