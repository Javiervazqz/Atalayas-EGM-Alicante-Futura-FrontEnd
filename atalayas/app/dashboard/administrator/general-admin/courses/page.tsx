'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
// Importamos el buscador para que sea idéntico al de Admin
import SearchInput from '@/components/ui/Searchbar';

interface Course {
    id: string;
    title: string;
    category: string;
}

export default function GeneralAdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'BASICO' | 'ESPECIALIZADO'>('BASICO');
    const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                setCourses(Array.isArray(data) ? data : (data.courses || []));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // Filtro combinado: Pestaña + Buscador
    const filtered = courses.filter(c => {
        const matchesTab = activeTab === 'BASICO'
            ? (c.category?.toUpperCase() !== 'ESPECIALIZADO')
            : (c.category?.toUpperCase() === 'ESPECIALIZADO');

        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'-apple-system', sans-serif" }}>
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 p-10 overflow-auto">
                {/* Header y Toolbar idénticos al de Admin */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Catálogo Maestro</h1>
                        <p className="text-[#86868b] mt-1 text-lg">Configura la oferta formativa global del sistema.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Buscador idéntico */}
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder='Buscar cursos globales...'
                        />

                        {/* Botón idéntico */}
                        <Link
                            href="/dashboard/general-admin/courses/new"
                            className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md shrink-0 text-center"
                        >
                            Nuevo Curso
                        </Link>
                    </div>
                </div>

                {/* Tabs Consistentes con "Onboarding" */}
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                    {['BASICO', 'ESPECIALIZADO'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${activeTab === tab
                                ? 'border-b-2 border-[#0071e3] text-[#0071e3]'
                                : 'text-[#86868b] hover:text-[#1d1d1f]'
                                }`}
                        >
                            {tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                        </button>
                    ))}
                </div>

                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-200" />)
                        : filtered.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
                                <p className="text-[#86868b] font-medium">No se han encontrado cursos en esta sección.</p>
                            </div>
                        ) : filtered.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between group hover:shadow-md transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${activeTab === 'BASICO' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                        </span>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${activeTab === 'BASICO' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {activeTab === 'BASICO' ? '📖' : '🎓'}
                                    </div>
                                    <h3 className="text-[#1d1d1f] font-semibold text-lg leading-tight mb-4 min-h-[3rem] line-clamp-2">
                                        {course.title}
                                    </h3>
                                </div>
                                <Link
                                    href={`/dashboard/general-admin/courses/${course.id}`}
                                    className="w-full py-2.5 bg-[#0071e3] text-white text-sm font-medium rounded-xl text-center hover:bg-[#0077ed] transition-colors shadow-sm"
                                >
                                    Gestionar Curso
                                </Link>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}