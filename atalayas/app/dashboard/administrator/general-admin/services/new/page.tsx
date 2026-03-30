'use client';

import { useEffect, useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

export default function NewGeneralService() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
    const [errors, setErrors] = useState<{title?: string; description?: string}>({});
    const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'INFO',
    mediaUrl: '',
    isPublic: true, // Por defecto público en General Admin
    companyId: ''   // El General Admin sí puede asignar empresa
    });

    useEffect(() =>{
        const fetchCompanies = async () => {
            const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
                headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });
            const data = await res.json();
            setCompanies(data);
        };
        fetchCompanies();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // Validaciones
        let newErrors: { title?: string; description?: string } = {};
        if (!formData.title.trim()) newErrors.title = "El título es obligatorio";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        const dataToSubmit = {
            title:formData.title,
            description: formData.description,
            mediaUrl: formData.mediaUrl,
            isPublic: formData.isPublic,
            companyId: formData.isPublic? null : formData.companyId,
            type: formData.serviceType,
        }
        try {
            const res = await fetch(API_ROUTES.SERVICES.CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Limpiamos el objeto: si es público, no enviamos companyId vacío
            body: JSON.stringify(dataToSubmit),
            });

            const data = await res.json();

            if (res.ok) {
            router.push('/dashboard/administrator/general-admin/services');
            router.refresh();
            } else {
            console.error('Error del servidor:', data);
            alert(`Error del servidor: ${data.message || 'No se pudo crear el servicio'}`);
            }
        } catch (error) {
            console.error('Error de red/conexión:', error);
            alert('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

        const companyNames = ['PUBLIC', ...companies.map(c => c.name)];

    return (
  <div className="flex min-h-screen bg-[#f5f5f7]">
    <Sidebar role="GENERAL_ADMIN" />

    <main className="flex-1 p-8 md:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        
        {/* Cabecera */}
        <header className="mb-12">
          <button 
            type="button"
            onClick={() => router.back()}
            className="text-[#0071e3] hover:text-[#0077ed] font-semibold mb-4 flex items-center gap-1 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver
          </button>
          <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Crear nuevo servicio</h1>
          <p className="text-[#86868b] mt-2 text-lg">Configura el alcance y contenido del servicio.</p>
        </header>

        {/* Formulario con onSubmit tradicional */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* SECCIÓN 1: ALCANCE (Tu Dropdown) */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] mb-6">
              Asignación de Visibilidad
            </label>
            
            <CompanyDropdown 
              companies={companyNames} 
              selected={selectedCompany}
              onChange={(val) => {
                setSelectedCompany(val);
                // Aquí actualizas tu estado manual de formData
                setFormData(prev => ({
                  ...prev,
                  isPublic: val === 'PUBLIC',
                  companyId: companies.find(c => c.name === val)?.id || ''
                }));
              }}
            />

            <div className={`mt-4 p-4 rounded-2xl transition-colors ${formData.isPublic ? 'bg-green-50/50 text-green-700' : 'bg-blue-50/50 text-blue-700'}`}>
              <p className="text-sm font-medium">
                {formData.isPublic 
                  ? "🌐 Este servicio será visible para todos los usuarios de Atalayas." 
                  : `🏢 Servicio exclusivo para empleados de ${selectedCompany}.`}
              </p>
            </div>
          </section>

          {/* SECCIÓN 2: CONTENIDO */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#86868b] mb-2">
              Detalles del Servicio
            </label>
            
        <div className="space-y-2 group">
            <input
                type="text"
                placeholder="Título del servicio..."
                value={formData.title}
                onChange={(e) => {
                setFormData({...formData, title: e.target.value});
                // Limpiamos el error mientras el usuario corrige
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

            {/* Mensaje de error */}
            <div className="h-5 ml-4">
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
                onClick={() => setFormData({...formData, serviceType: 'INFO'})}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${
                  formData.serviceType === 'INFO' ? 'border-[#0071e3] bg-blue-50/30' : 'border-transparent bg-[#f5f5f7]'
                }`}
              >
                <span className="text-3xl block mb-2">ℹ️</span>
                <p className="font-bold text-[#1d1d1f]">Informativo</p>
                <p className="text-xs text-[#86868b] mt-1">Contenido estático de consulta.</p>
              </div>

              <div 
                onClick={() => setFormData({...formData, serviceType: 'BOOKING'})}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${
                  formData.serviceType === 'BOOKING' ? 'border-[#0071e3] bg-blue-50/30' : 'border-transparent bg-[#f5f5f7]'
                }`}
              >
                <span className="text-3xl block mb-2">🗓️</span>
                <p className="font-bold text-[#1d1d1f]">Reserva</p>
                <p className="text-xs text-[#86868b] mt-1">Gestión de citas y calendario.</p>
              </div>
            </div>
            {/* BOTÓN DE ACCIÓN */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold hover:bg-[#0077ed] transition-all">
              {loading ? "Publicando..." : "Publicar Servicio"}
            </button>
          </div>
          </section>   
        </form>
      </div>
    </main>
  </div>
);
}