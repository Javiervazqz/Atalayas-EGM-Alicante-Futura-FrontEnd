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
        isPublic: false, // Siempre falso para administradores de empresa
        category: 'BASICO',
        file: null as File | null
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.title.trim()) return alert("El título es obligatorio");

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const payload = {
                title: formData.title.trim(),
                isPublic: false, // Forzamos false en el envío
                category: formData.category,
                fileUrl: formData.file ? formData.file.name : null,
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
                // Redirigimos a la gestión de cursos
                router.push('/dashboard/administrator/admin/courses/manage');
            } else {
                const errorData = await res.json();
                console.error("Error backend:", errorData);
                alert("Error al guardar en la base de datos: " + (errorData.message || ""));
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
                        <button onClick={() => router.back()} className="text-[#0071e3] font-medium mb-4 flex items-center gap-2 hover:underline">
                            ← Volver
                        </button>
                        <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Nuevo Curso</h1>
                        <p className="text-[#86868b] mt-2">Crea un nuevo curso para los empleados de tu empresa.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">

                        {/* 1. TÍTULO */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] outline-none font-bold text-[#1d1d1f] transition-all"
                                placeholder="Ej: Prevención de Riesgos"
                            />
                        </div>

                        {/* 2. CATEGORÍA */}
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

                        {/* 3. MATERIAL PDF */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] ml-1">Documento de estudio</label>
                            <div className="relative h-32 w-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-[#f5f5f7] hover:border-blue-400 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="text-center px-4">
                                    <p className="font-bold text-[#1d1d1f] truncate max-w-xs">
                                        {formData.file ? formData.file.name : 'Seleccionar PDF'}
                                    </p>
                                    <p className="text-xs text-[#86868b] mt-1">{formData.file ? 'Archivo cargado correctamente' : 'Haz clic para subir el material formativo'}</p>
                                </div>
                            </div>
                        </div><br />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#1d1d1f] text-white rounded-2xl font-bold text-lg hover:bg-black disabled:bg-gray-400 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                        >
                            {loading ? 'Creando curso...' : 'Crear Curso'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}