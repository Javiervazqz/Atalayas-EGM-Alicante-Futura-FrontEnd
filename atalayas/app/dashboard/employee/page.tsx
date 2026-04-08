'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

// --- ESTRUCTURA DE DATOS DE ONBOARDING ---
const ONBOARDING_STEPS = [
  {
    day: 1,
    badge: "Bienvenida",
    title: "Día 1: Tu aterrizaje",
    description: "Primeros pasos críticos para configurar tu entorno de trabajo.",
    tasks: [
      { id: 't1', label: 'Completa tu perfil de usuario', done: true },
      { id: 't2', label: 'Firma digital del contrato', done: false },
      { id: 't3', label: 'Lectura del reglamento interno', done: false },
    ]
  },
  {
    day: 2,
    badge: "Cultura EGM",
    title: "Día 2: Entorno Atalayas",
    description: "Conoce los servicios, seguridad y ventajas de trabajar en el polígono.",
    tasks: [
      { id: 't4', label: 'Explora servicios de restauración', done: false },
      { id: 't5', label: 'Revisa el plan de movilidad y parking', done: false },
      { id: 't6', label: 'Acceso al portal de documentos', done: false },
    ]
  },
  {
    day: 3,
    badge: "Formación",
    title: "Día 3: Capacitación",
    description: "Comienza tus cursos de seguridad y metodología.",
    tasks: [
      { id: 't7', label: 'Curso: Prevención de riesgos laborales', done: false },
      { id: 't8', label: 'Video: Historia de Alicante Futura', done: false },
    ]
  }
];

export default function EmployeeDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [currentDay, setCurrentDay] = useState(1); // Control de evolución

  // 1. Carga de datos iniciales
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);

      // LÓGICA DE DÍAS: Calculamos la diferencia entre hoy y la creación de cuenta
      if (storedUser.createdAt) {
        const signupDate = new Date(storedUser.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - signupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(diffDays, ONBOARDING_STEPS.length));
      }
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COURSES.GET_ALL, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers de datos
  const firstName = user?.name || user?.email?.split('@')[0] || 'Empleado';
  const unlockedSteps = ONBOARDING_STEPS.filter(s => s.day <= currentDay);
  const allUnlockedTasks = unlockedSteps.flatMap(s => s.tasks);
  const completedTasks = allUnlockedTasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedTasks / allUnlockedTasks.length) * 100);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* COLUMNA CENTRAL: CONTENIDO PRINCIPAL */}
        <div className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-10 no-scrollbar">
          
          {/* Header Bienvenida */}
          <header className="mb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight">¡Hola, {firstName}! 👋</h1>
                    <p className="text-gray-500 mt-1 font-medium">Estás en tu <span className='font-black px-1 py-1 rounded-lg hover:shadow-lg transition-all bg-[#d9ff00] text-[#005596]'>Día {currentDay}</span> de incorporación.</p>
                </div>
                {/* BOTÓN DESARROLLO (Borrar en producción) */}
                <button 
                    onClick={() => setCurrentDay(prev => prev < 3 ? prev + 1 : 1)}
                    className="bg-[#d9ff00] text-[#005596] text-[10px] font-black px-3 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                    DEBUG: SIGUIENTE DÍA
                </button>
            </div>
          </header>

          {/* LISTADO DE ONBOARDING EVOLUTIVO */}
          <section className="space-y-6 mb-12">
            <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em] mb-4">Tu Ruta de Incorporación</h2>
            
            {unlockedSteps.map((step) => (
              <div key={step.day} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#d9ff00] text-[#005596] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {step.badge}
                  </span>
                  {step.day < currentDay && (
                    <span className="text-[#005596] text-[10px] font-bold">✓ Completado</span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm mb-6 font-medium">{step.description}</p>

                <div className="grid gap-3">
                  {step.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-[#d9ff00] transition-all group cursor-pointer">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-[#005596] border-[#005596]' : 'border-gray-200 group-hover:border-[#d9ff00]'}`}>
                        {task.done && <span className="text-[#d9ff00] text-xs">✓</span>}
                      </div>
                      <span className={`text-sm font-bold ${task.done ? 'text-gray-400 line-through' : 'text-[#1d1d1f]'}`}>
                        {task.label}
                      </span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#005596]">→</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* PANEL DERECHO: MÉTRICAS Y PERFIL */}
        <aside className="w-full md:w-80 h-screen border-l border-gray-100 bg-white p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">

            {/* Decoración círculo fondo */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#d9ff00]/10 rounded-full blur-2xl"></div>
          

          {/* Progreso Circular o Barra */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tu Progreso Total</h4>
            <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-black text-[#005596]">{progressPercent}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{completedTasks} de {allUnlockedTasks.length} tareas</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#d9ff00] rounded-full transition-all duration-1000 shadow-[0_0_10px_#d9ff00]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
          </div>

          {/* Accesos rápidos con estilo EGM */}
          <div className="space-y-4">
            {/* CURSOS */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em]">Formación Recomendada</h2>
                <Link href="/dashboard/employee/courses" className="text-[#005596] text-xs font-bold hover:underline">Ver catálogo completo</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
              {loading ? (
                [1,2,3].map(n => <div key={n} className="h-48 bg-gray-200 rounded-[32px] animate-pulse" />)
              ) : (
                courses.slice(0, 3).map((course) => (
                  <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`}>
                    <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
                        <div className="h-18 bg-[#005596] flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                            <i className="bi bi-mortarboard-fill text-white"></i>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-[#1d1d1f] text-sm leading-tight mb-2 group-hover:text-[#005596]">{course.title}</h4>
                            <span className="text-[10px] font-black uppercase text-[#005596] bg-blue-50 px-2 py-1 rounded-md">
                                {course.isPublic ? 'Público' : 'Empresa'}
                            </span>
                        </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
          </div>
        </aside>
      </main>
    </div>
  );
}