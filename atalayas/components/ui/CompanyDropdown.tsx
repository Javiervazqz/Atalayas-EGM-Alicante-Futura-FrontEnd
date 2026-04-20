'use client';

import { useState, useEffect } from 'react';

interface CompanyDropdownProps {
  companies: string[];
  selected: string;
  onChange: (company: string) => void;
  defaultLabel?: string; // Nueva prop: "Todas", "Público", etc.
}

export default function CompanyDropdown({ 
  companies, 
  selected, 
  onChange, 
  defaultLabel = "Público" // Por defecto será Público
}: CompanyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c => {
    if (c === 'Atalayas EGM') return false;
    // Buscamos por el ID interno ('ALL' o 'PUBLIC') o por el nombre
    return c === 'ALL' || c === 'PUBLIC' || c.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.relative')) setOpen(false);
    };
    if (open) window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [open]);

  // Función para renderizar el texto bonito
  const renderLabel = (value: string) => {
    if (value === 'ALL') return `🏢 ${defaultLabel}`;
    if (value === 'PUBLIC') return `🌐 ${defaultLabel}`;
    return `🏭 ${value}`;
  };

  return (
    <div className="relative mb-8">
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-semibold text-[#1d1d1f] hover:border-gray-400 transition-all w-64"
      >
        <span>{renderLabel(selected)}</span>
        <span className="ml-auto text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-14 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-72 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full text-sm outline-none px-3 py-2 bg-[#f5f5f7] rounded-xl"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((company) => (
              <button
                key={company}
                onClick={() => { onChange(company); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-[#f5f5f7] transition-colors ${
                  selected === company ? 'font-bold text-[#0071e3]' : 'text-[#1d1d1f]'
                }`}
              >
                {renderLabel(company)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}