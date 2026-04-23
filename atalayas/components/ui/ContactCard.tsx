'use client';

import React from 'react';

interface ContactCardProps {
  service: {
    providerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    schedule?: string;
    price?: string;
    externalUrl?: string;
  };
}

export default function ContactCard({ service }: ContactCardProps) {
  const items = [
    { label: 'Proveedor', value: service.providerName, icon: 'bi-building-check' },
    { label: 'Teléfono', value: service.phone, icon: 'bi-telephone' },
    { label: 'Email', value: service.email, icon: 'bi-envelope-at' },
    { label: 'Dirección', value: service.address, icon: 'bi-geo-alt' },
    { label: 'Horario', value: service.schedule, icon: 'bi-clock' },
    { label: 'Precio', value: service.price, icon: 'bi-currency-euro' },
  ];

  // Filtramos solo los que tienen valor
  const activeItems = items.filter(item => item.value);

  return (
    <div className="bg-card rounded-[2rem] border border-border p-8 shadow-xl shadow-foreground/5 sticky top-8 animate-in slide-in-from-right-4 duration-700">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 border-b border-border pb-4">
        Información de contacto
      </h4>

      <div className="space-y-6 mb-10">
        {activeItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 group">
            <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <i className={`bi ${item.icon} text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                {item.label}
              </p>
              <p className="text-sm font-bold text-foreground leading-tight wrap-break-words">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {service.externalUrl && (
        <a
          href={service.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-secondary/20"
        >
          <i className="bi bi-info-circle-fill text-sm"></i>
          Más información
        </a>
      )}
    </div>
  );
}