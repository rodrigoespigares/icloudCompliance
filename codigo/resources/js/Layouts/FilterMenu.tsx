import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';

export interface FilterMenuProps {
  isVisible: boolean;
  onFilterChange: (filters: {
    name?: string;
    priority?: number;
    dateApprovedStart?: string;
    dateApprovedEnd?: string;
    dateCreatedStart?: string;
    dateCreatedEnd?: string;
  }) => void;

  handleShowFilterMenu: () => void;
}

export default function FilterMenu({ isVisible, onFilterChange, handleShowFilterMenu }: FilterMenuProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<number | ''>('');
  const [dateApprovedStart, setDateApprovedStart] = useState('');
  const [dateApprovedEnd, setDateApprovedEnd] = useState('');
  const [dateCreatedStart, setDateCreatedStart] = useState('');
  const [dateCreatedEnd, setDateCreatedEnd] = useState('');

  useEffect(() => {
    if (isVisible) {
      setName('');
      setPriority('');
      setDateApprovedStart('');
      setDateApprovedEnd('');
      setDateCreatedStart('');
      setDateCreatedEnd('');
    }
  }, [isVisible]);

  const handleApplyFilters = () => {
    onFilterChange({
      name,
      priority: priority ? Number(priority) : undefined,
      dateApprovedStart,
      dateApprovedEnd,
      dateCreatedStart,
      dateCreatedEnd,
    });
  };

  const handleClearFilters = () => {
    setName('');
    setPriority('');
    setDateApprovedStart('');
    setDateApprovedEnd('');
    setDateCreatedStart('');
    setDateCreatedEnd('');
    onFilterChange({});
  };

  const handleCloseMenu = () => {
    handleShowFilterMenu()
  };

  return (
    <div
      className={`fixed top-0 right-0 z-100 h-full w-[20vw] bg-gray-100 text-black p-4 transition-opacity duration-300 ease-in-out shadow-xl 
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="relative">
        <h2 className="text-lg font-semibold mb-4">Filtrar Documentos</h2>
        <button onClick={handleCloseMenu} className="absolute top-0 right-0 p-2 text-white hover:bg-red-500 rounded-full">
          <Icon icon="bx:x" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded text-primary"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Prioridad:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full p-2 rounded text-primary"
        >
          <option value="">Todas</option>
          <option value="1">Baja</option>
          <option value="2">Media</option>
          <option value="3">Alta</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Fecha de Aprobación (Desde):</label>
        <input
          type="date"
          value={dateApprovedStart}
          onChange={(e) => setDateApprovedStart(e.target.value)}
          className="w-full p-2 rounded text-primary"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Fecha de Aprobación (Hasta):</label>
        <input
          type="date"
          value={dateApprovedEnd}
          onChange={(e) => setDateApprovedEnd(e.target.value)}
          className="w-full p-2 rounded text-primary"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Fecha de Creación (Desde):</label>
        <input
          type="date"
          value={dateCreatedStart}
          onChange={(e) => setDateCreatedStart(e.target.value)}
          className="w-full p-2 rounded text-primary"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Fecha de Creación (Hasta):</label>
        <input
          type="date"
          value={dateCreatedEnd}
          onChange={(e) => setDateCreatedEnd(e.target.value)}
          className="w-full p-2 rounded text-primary"
        />
      </div>
      <div className="flex space-x-2">
        <button onClick={handleApplyFilters} className="bg-blue-500 rounded py-2 px-4 text-white hover:bg-blue-600">
          Aplicar Filtros
        </button>
        <button onClick={handleClearFilters} className="bg-red-500 rounded py-2 px-4 text-white hover:bg-red-600">
          Borrar Filtros
        </button>
      </div>
    </div>
  );
}