'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Recuperamos el usuario para obtener su companyId
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO', // CAMBIO: Valor inicial para Onboarding
        file: null as File | null // CAMBIO: Estado para el PDF
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.title.trim()) return alert("El título es obligatorio");

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // CAMBIO: Preparamos el objeto con las nuevas columnas
            const payload = {
                title: formData.title,
                isPublic: formData.isPublic,
                category: formData.category,
                fileUrl: formData.file ? formData.file.name : null, // Guardamos el nombre como referencia
                companyId: user.companyId || null
            };

            const res = await fetch(API_ROUTES.COURSES.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/dashboard/administrator/admin/courses');
            } else {
                const errorData = await res.json();
                console.error("Error backend:", errorData);
                alert("Error al guardar en la base de datos.");
            }
        } catch (err) {
            alert("Error de conexión.");
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
                        <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Nuevo Curso</h1>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">

                        {/* 1. TÍTULO */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] outline-none font-bold"
                                placeholder="Introduzca nombre del curso"
                            />
                        </div>

                        {/* 2. CATEGORÍA (NUEVO) */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Tipo de Formación</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold ${formData.category === 'BASICO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    📖 Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold ${formData.category === 'ESPECIALIZADO' ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-transparent bg-[#f5f5f7] text-[#86868b]'}`}
                                >
                                    🎓 Especialización
                                </button>
                            </div>
                        </div>

                        {/* 3. MATERIAL PDF (NUEVO) */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Documento de estudio</label>
                            <div className="relative h-32 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="text-center">
                                    <p className="font-bold text-[#1d1d1f]">{formData.file ? formData.file.name : 'Seleccionar PDF'}</p>
                                    <p className="text-xs text-[#86868b]">{formData.file ? 'Archivo listo' : 'Formatos aceptados: .pdf'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. VISIBILIDAD */}
                        <div
                            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                            className={`p-6 cursor-pointer rounded-3xl border-2 transition-all flex items-center justify-between ${formData.isPublic ? 'border-green-500 bg-green-50' : 'bg-[#f5f5f7] border-transparent'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{formData.isPublic ? '🌐' : '🔒'}</span>
                                <div>
                                    <p className="font-bold text-[#1d1d1f]">{formData.isPublic ? 'Público' : 'Privado'}</p>
                                    <p className="text-xs text-[#86868b]">Control de acceso global</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-bold text-lg hover:bg-[#0077ed] disabled:bg-gray-400 shadow-md"
                        >
                            {loading ? 'Creando curso...' : 'Crear Curso'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}