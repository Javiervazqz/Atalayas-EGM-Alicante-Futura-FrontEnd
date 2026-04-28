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
    if(c === 'EGM Atalayas') return false;
    return c === 'PUBLIC' || c.toLowerCase().includes(search.toLowerCase());
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
      {/* ── BOTÓN DESPLEGABLE ── */}
      <button
        type='button'
        onClick={() => setOpen(!open)}
        // Cambiado bg-white por bg-background y los bordes fijos por border-border
        className="flex items-center gap-3 bg-background border border-border rounded-2xl px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/40 hover:shadow-sm transition-all w-64"
      >
        <span>{selected === 'PUBLIC' ? '🌐 Público' : `🏭 ${selected}`}</span>
        <span className="ml-auto text-muted-foreground">{open ? '▲' : '▼'}</span>
      </button>

      {/* ── MENÚ DE OPCIONES ── */}
      {open && (
        // Cambiado bg-white por bg-card
        <div className="absolute top-14 left-0 bg-card border border-border rounded-2xl shadow-xl z-50 w-72 overflow-hidden">
          
          <div className="p-3 border-b border-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              // Adaptado el input de búsqueda para que se lea perfecto en oscuro
              className="w-full text-sm outline-none px-3 py-2 bg-muted/50 focus:bg-background border border-transparent focus:border-primary/30 rounded-xl transition-all text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((company) => (
              <button
                key={company}
                onClick={() => { onChange(company); setOpen(false); setSearch(''); }}
                // Usamos text-primary en lugar de un azul HEX fijo (#0071e3)
                className={`w-full text-left px-5 py-3 text-sm hover:bg-muted transition-colors ${
                  selected === company 
                    ? 'font-bold text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-foreground'
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