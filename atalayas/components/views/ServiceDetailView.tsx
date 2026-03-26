'use client';

interface Service {
  id: string;
  title: string;
  company_name: string;
  description: string;
  type: 'BOOKING' | 'INFO';
  is_public: boolean;
  pdf_url?: string;
  schedule_text?: string; // Por si tienes el horario en un campo de texto
  location?: string;
}

export default function ServiceDetailView({ service, role }: { service: Service, role: string }) {
  
  // Verificación de seguridad básica
  if (role === 'PUBLIC' && !service.is_public) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold">Servicio Privado</h2>
        <p className="text-gray-500">Inicia sesión para ver este contenido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Botón Volver */}
      <button 
        onClick={() => window.history.back()}
        className="text-[#0071e3] mb-8 font-medium flex items-center gap-2 hover:underline"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Lado Izquierdo: Información */}
        <div className="lg:col-span-2 space-y-8">
          <header>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              {service.type}
            </p>
            <h1 className="text-5xl font-extrabold text-[#1d1d1f] tracking-tight">
              {service.title}
            </h1>
            <p className="text-xl text-[#86868b] mt-4">
              Servicio de <span className="text-[#1d1d1f] font-semibold">{service.company_name}</span>
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-[#1d1d1f]">Sobre este servicio</h3>
            <p className="text-[#1d1d1f] leading-relaxed opacity-90">
              {service.description}
            </p>
          </div>

          {/* Información adicional (si tienes los campos en la tabla) */}
          {(service.schedule_text || service.location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {service.schedule_text && (
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Horario</span>
                  <span className="text-lg font-semibold">{service.schedule_text}</span>
                </div>
              )}
              {service.location && (
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Ubicación</span>
                  <span className="text-lg font-semibold">{service.location}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lado Derecho: Acción (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/40">
            <div className="mb-8">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Acceso</span>
              <p className="text-3xl font-bold text-[#1d1d1f] mt-1">Gratuito</p>
            </div>

            {service.type === 'BOOKING' ? (
              <button className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold text-lg hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-100">
                Solicitar Reserva
              </button>
            ) : (
              <button 
                onClick={() => service.pdf_url && window.open(service.pdf_url, '_blank')}
                className="w-full py-4 bg-[#1d1d1f] text-white rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span> Ver Documento
              </button>
            )}
            
            <p className="mt-6 text-center text-[11px] text-[#86868b] leading-relaxed">
              Consulta condiciones con el responsable de tu empresa en el Polígono Atalayas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}