import React from "react";
import "./FieldFilters.css";
import { FaFilter } from "react-icons/fa";

export interface FieldFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  leastReserved: boolean;
  setLeastReserved: (v: boolean) => void;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
}

const FieldFilters: React.FC<FieldFiltersProps> = ({
  search,
  setSearch,
  location,
  setLocation,
  price,
  setPrice,
  type,
  setType,
  leastReserved,
  setLeastReserved,
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
            type="text"
            placeholder="Buscar campo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar campo por nombre"
          />
          <input
            type="text"
            placeholder="Ubicación"
            value={location}
            onChange={e => setLocation(e.target.value)}
            aria-label="Filtrar por ubicación"
          />
          <input
            type="number"
            placeholder="Precio máximo (€)"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min={0}
            aria-label="Filtrar por precio máximo"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            aria-label="Filtrar por tipo de campo"
          >
            <option value="">Tipo de campo</option>
            <option value="futbol7">Fútbol 7</option>
            <option value="futbol11">Fútbol 11</option>
          </select>
        </div>
        <div className="dashboard-checkbox-row">
          <label className="least-reserved-label">
            <input
              type="checkbox"
              checked={leastReserved}
              onChange={e => setLeastReserved(e.target.checked)}
              style={{ accentColor: '#003366', marginRight: 8 }}
            />
            Ordenar por menos reservas disponibles
          </label>
        </div>
      </div>
    )}
  </div>
);

export default FieldFilters;
