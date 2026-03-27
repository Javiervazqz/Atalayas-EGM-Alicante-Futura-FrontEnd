'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";


export default function ServiceDetailAdmin() {
    const params = useParams();
    const router = useRouter();

    const [service, setService] = useState<any>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{ title?: string }>({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        serviceType: 'INFO',
        isPublic: true,
        companyId: '',
    });
    const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');

    // ── Fetch service + companies ──────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [svcRes, compRes] = await Promise.all([
                fetch(`${API_ROUTES.SERVICES.GET_ALL}/${params.id}`, { headers }),
                fetch(API_ROUTES.COMPANIES.GET_ALL, { headers }),
            ]);

            const svcData = await svcRes.json();
            const compData = await compRes.json();
            console.log(svcData)
            console.log(compData)

            setService(svcData);
            setCompanies(compData);

            // Hydrate form
            const matchedCompany = compData.find((c: any) => c.id === svcData.companyId);
            setFormData({
                title: svcData.title || '',
                description: svcData.description || '',
                serviceType: svcData.type || 'INFO',
                isPublic: svcData.isPublic ?? true,
                companyId: svcData.companyId || '',
            });
            // Explícito: solo mostramos el nombre de empresa si isPublic es false Y hay empresa
            setSelectedCompany(svcData.isPublic === false && matchedCompany ? matchedCompany.name : 'PUBLIC');
            setLoading(false);
        };

        if (params.id) fetchAll();
    }, [params.id]);


    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setErrors({});
        if (!formData.title.trim()) {
            setErrors({ title: 'El título es obligatorio' });
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_ROUTES.SERVICES.GET_ALL}/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    type: formData.serviceType,
                    isPublic: formData.isPublic,
                    companyId: formData.isPublic ? null : formData.companyId,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setService(updated);
                // Resync selectedCompany con los datos guardados
                const savedCompany = companies.find((c: any) => c.id === updated.companyId);
                setSelectedCompany(updated.isPublic === false && savedCompany ? savedCompany.name : 'PUBLIC');
                setIsEditing(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                const err = await res.json();
                alert(`Error: ${err.message || 'No se pudo guardar'}`);
            }
        } catch {
            alert('No se pudo conectar con el servidor.');
        } finally {
            setSaving(false);
        }
    };

    // ── Discard ───────────────────────────────────────────────────────────────
    const handleDiscard = () => {
        const matchedCompany = companies.find((c: any) => c.id === service.companyId);
        setFormData({
            title: service.title || '',
            description: service.description || '',
            serviceType: service.serviceType || 'INFO',
            isPublic: service.isPublic ?? true,
            companyId: service.companyId || '',
        });
        setSelectedCompany(service.isPublic === false && matchedCompany ? matchedCompany.name : 'PUBLIC');
        setErrors({});
        setIsEditing(false);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        setDeleting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_ROUTES.SERVICES.GET_ALL}/${params.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                router.push('/dashboard/administrator/general-admin/services');
                router.refresh();
            } else {
                alert('No se pudo eliminar el servicio.');
            }
        } catch {
            alert('Error de conexión.');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const names = Array.isArray(companies) ? companies.map(c => c.name) : [];
    const companyNames = ['PUBLIC', ...names];
    const isBooking = formData.serviceType === 'BOOKING';
    const accentColor = isBooking ? '#af52de' : '#0071e3';

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading)
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );

    if (!service) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
            <Sidebar role="GENERAL_ADMIN" />

            <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>

                {/* HEADER */}
                <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '24px', padding: 0 }}
                        >
                            ‹ Volver a servicios
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '72px', height: '72px', background: isBooking ? 'rgba(175,82,222,0.1)' : 'rgba(0,113,227,0.1)',
                                borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0
                            }}>
                                {isBooking ? '📅' : 'ℹ️'}
                            </div>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', margin: 0 }}>
                                    {service.title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 flex-1 justify-center">
                                {saveSuccess && (
                                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 animate-in fade-in duration-300">
                                        ✓ Cambios guardados
                                    </span>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 shrink-0">
                                {!isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
                                        >
                                            Editar servicio
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleDiscard}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424245] bg-[#f5f5f7] hover:bg-gray-200 transition-colors"
                                        >
                                            Descartar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors disabled:opacity-60"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
                    <div className="content-layout">
                        <div className="main-text">
                            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>
                                {isEditing ? 'Editando información' : 'Sobre el servicio'}
                            </h3>

                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Título */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#86868b', marginBottom: '8px' }}>Título del servicio</label>
                                        <input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d2d2d7', fontSize: '16px' }}
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#86868b', marginBottom: '8px' }}>Descripción</label>
                                        <textarea
                                            rows={6}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d2d2d7', fontSize: '16px', lineHeight: '1.5' }}
                                        />
                                    </div>

                                    {/* Selector de Empresa (Si tienes el componente) */}
                                    <div style={{ zIndex: 10 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#86868b', marginBottom: '8px' }}>Visibilidad / Empresa</label>
                                        <CompanyDropdown
                                            companies={companyNames}
                                            selected={selectedCompany}
                                            onChange={(val) => {
                                                setSelectedCompany(val);
                                                const comp = companies.find(c => c.name === val);
                                                setFormData({
                                                    ...formData,
                                                    isPublic: val === 'PUBLIC',
                                                    companyId: val === 'PUBLIC' ? '' : (comp?.id || '')
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#424245', whiteSpace: 'pre-wrap' }}>
                                    {service.description || 'No hay descripción disponible.'}
                                </p>
                            )}
                        </div>

                        {/* La Action Box (Lateral) */}
                        <div className="action-box">
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase' }}>Estado</span>
                                <p style={{ fontSize: '18px', fontWeight: 600, color: formData.isPublic ? '#34c759' : '#ff9500', margin: 0 }}>
                                    {formData.isPublic ? '🌐 Público' : '🏢 Privado'}
                                </p>
                                <button style={{
                                    width: '100%', padding: '18px', marginTop: '20px', borderRadius: '16px', border: 'none',
                                    background: accentColor, color: '#fff',
                                    fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                                    boxShadow: `0 4px 15px ${isBooking ? 'rgba(175,82,222,0.2)' : 'rgba(0,113,227,0.2)'}`,
                                    transition: 'transform 0.2s'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Consultar Información
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setShowDeleteModal(false)} // Cierra al hacer clic fuera (en el fondo)
                >
                    <div
                        className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del cuadro cierre el modal
                    >
                        <div className="text-5xl mb-6 text-center">🗑️</div>
                        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3 text-center tracking-tight">
                            ¿Eliminar servicio?
                        </h2>
                        <p className="text-[15px] text-[#86868b] mb-8 text-center leading-relaxed">
                            Estás a punto de eliminar <span className="font-semibold text-[#1d1d1f]">"{service.title}"</span>.
                            Esta acción es permanente y no se puede deshacer.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full py-4 rounded-2xl text-md font-bold bg-[#ff3b30] text-white hover:bg-[#e32d24] active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar servicio'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-4 rounded-2xl text-md font-semibold bg-transparent text-[#0071e3] hover:bg-[#f5f5f7] transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style jsx>{`
          .content-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 60px;
          }
  
          .action-box {
            background: #fff;
            padding: 32px;
            border-radius: 24px;
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0 2px 12px rgba(0,0,0,0.03);
            height: fit-content;
          }
  
          @media (min-width: 1025px) {
            .action-box {
              position: sticky;
              top: 40px;
            }
          }
  
          @media (max-width: 1024px) {
            .content-layout {
              grid-template-columns: 1fr;
              gap: 32px;
            }
            .action-box {
              margin-top: 20px;
              padding: 24px;
            }
          }
        `}</style>
        </div>
    );
}