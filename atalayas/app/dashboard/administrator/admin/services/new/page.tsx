'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewCompanyService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{title?: string; description?: string}>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    type: 'INFO',
    isPublic: false // Siempre falso por defecto para empresas
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

     if (!formData.title.trim()) {
      setTimeout(() => {
      setErrors({ title: "El título es necesario para crear el servicio" });
    }, 10);
    return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) router.push('/dashboard/administrator/admin/services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <button onClick={() => router.back()} className="text-[#0071e3] font-medium mb-4 flex items-center gap-2">
              ← Volver
            </button>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Crear nuevo servicio</h1>
          </header>

          <form onSubmit={handleSubmit} noValidate className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] mb-2">Detalles del Servicio</label>
                <input 
                    type="text" 
                    placeholder="Título del servicio..."
                    value={formData.title}
                    onChange={e => {
                    setFormData({...formData, title: e.target.value});
                    // Limpia el error mientras el usuario escribe
                    if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                    }}
                    className={`
                    w-full px-6 py-5 rounded-2xl outline-none transition-all text-xl font-bold 
                    ${errors.title 
                        ? 'border-2 border-red-400 bg-red-50/30 text-red-900 animate-shake' 
                        : 'border-2 border-transparent bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white text-[#1d1d1f]'
                    }
                    `}
                />
                {/* Espacio para el mensaje de error */}
                <div className="h-5 mt-2 ml-1">
                    {errors.title && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        <span className="text-sm">⚠️</span> {errors.title}
                    </p>
                    )}
                </div>
                </div>
            <textarea
              required
              placeholder="Descripción detallada..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-6 py-5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all resize-none text-[#424245] leading-relaxed"
            />

            {/* SECCIÓN: MEDIA URL (Imagen) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] ml-1">Imagen de portada (URL)</label>
              <input 
                type="url" 
                placeholder="https://tusitio.com/imagen.jpg"
                value={formData.mediaUrl}
                onChange={e => setFormData({...formData, mediaUrl: e.target.value})}
                className="w-full px-6 py-4 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245]"
              />
              {formData.mediaUrl && (
                <div className="mt-4 rounded-xl overflow-hidden h-32 w-full border border-gray-100">
                   <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>

            {/* TIPO DE SERVICIO (Cards seleccionables) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div 
                onClick={() => setFormData({...formData, type: 'INFO'})}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${
                  formData.type === 'INFO' ? 'border-[#0071e3] bg-blue-50/30' : 'border-transparent bg-[#f5f5f7]'
                }`}
              >
                <span className="text-3xl block mb-2">ℹ️</span>
                <p className="font-bold text-[#1d1d1f]">Informativo</p>
                <p className="text-xs text-[#86868b] mt-1">Contenido estático de consulta.</p>
              </div>

              <div 
                onClick={() => setFormData({...formData, type: 'BOOKING'})}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${
                  formData.type === 'BOOKING' ? 'border-[#0071e3] bg-blue-50/30' : 'border-transparent bg-[#f5f5f7]'
                }`}
              >
                <span className="text-3xl block mb-2">🗓️</span>
                <p className="font-bold text-[#1d1d1f]">Reserva</p>
                <p className="text-xs text-[#86868b] mt-1">Gestión de citas y calendario.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold hover:bg-[#0077ed] transition-all">
              {loading ? 'Publicando...' : 'Publicar Servicio'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}