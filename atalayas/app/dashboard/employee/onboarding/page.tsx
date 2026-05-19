'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/pageHeader";

// Puerto de tu backend NestJS (cambia según tu configuración)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function EmployeeDashboard() {
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [specializationsData, setSpecializationsData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);

      const dateToCompare = storedUser.firstLoginAt || storedUser.createdAt;

      if (dateToCompare) {
        const referenceDate = new Date(dateToCompare);
        const today = new Date();

        const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setCurrentDay(diffDays > 0 ? diffDays : 1);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetchedRef.current) return;

      hasFetchedRef.current = true;

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resCourses, resOnboarding] = await Promise.all([
          fetch(`${BACKEND_URL}/courses`, { headers }),
          fetch(`${BACKEND_URL}/onboarding/employee`, { headers }),
        ]);

        if (!resCourses.ok) {
          console.error("Error en cursos:", resCourses.status);
        }
        if (!resOnboarding.ok) {
          console.error("Error en onboarding:", resOnboarding.status);
          setLoading(false);
          return;
        }

        const dataCourses = await resCourses.json();
        const onboardingResponse = await resOnboarding.json();

        console.log("Respuesta onboarding:", onboardingResponse);

        setCourses(Array.isArray(dataCourses) ? dataCourses : []);

        const general = onboardingResponse.general || [];
        const specializations = onboardingResponse.specializations || [];

        console.log("General:", general.length);
        console.log("Especializaciones:", specializations.length);

        setOnboardingData(general);
        setSpecializationsData(specializations);
      } catch (err) {
        console.error("Error en fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Actualizar en onboardingData
    const updatedOnboarding = onboardingData.map((step) => ({
      ...step,
      onboardingTasks: step.onboardingTasks?.map((task: any) =>
        task.id === taskId ? { ...task, userProgress: [{ done: newStatus }] } : task
      ),
    }));
    setOnboardingData(updatedOnboarding);

    // Actualizar en specializationsData
    const updatedSpecializations = specializationsData.map((step) => ({
      ...step,
      onboardingTasks: step.onboardingTasks?.map((task: any) =>
        task.id === taskId ? { ...task, userProgress: [{ done: newStatus }] } : task
      ),
    }));
    setSpecializationsData(updatedSpecializations);

    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/onboarding/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId, done: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const firstName = user?.name?.split(' ')[0] || "Usuario";

  // Calcular progreso de onboarding
  const maxAvailableDay = onboardingData.length > 0
    ? Math.max(...onboardingData.map(s => s.day))
    : 1;

  const displayDay = Math.min(currentDay, maxAvailableDay);

  const visibleSteps = onboardingData.filter((s) => s.day <= displayDay);

  const allTasks = visibleSteps.flatMap((s) => s.onboardingTasks || []);
  const completedTasks = allTasks.filter((t) => t.userProgress?.[0]?.done === true).length;
  const totalTasks = allTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Progreso de especializaciones
  const allSpecializationTasks = specializationsData.flatMap((s) => s.onboardingTasks || []);
  const completedSpecializationTasks = allSpecializationTasks.filter((t) => t.userProgress?.[0]?.done === true).length;
  const totalSpecializationTasks = allSpecializationTasks.length;
  const specializationProgress = totalSpecializationTasks > 0 ? Math.round((completedSpecializationTasks / totalSpecializationTasks) * 100) : 0;

  // Progreso total (onboarding + especializaciones)
  const totalAllTasks = totalTasks + totalSpecializationTasks;
  const totalCompletedTasks = completedTasks + completedSpecializationTasks;
  const totalProgressPercent = totalAllTasks > 0 ? Math.round((totalCompletedTasks / totalAllTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <main className="flex-1 overflow-auto flex flex-col relative">

        <PageHeader
          title={`¡Bienvenido, ${firstName}!`}
          description={`Estás en tu día ${displayDay} de incorporación profesional.`}
          icon={<i className="bi bi-person-badge-fill"></i>}
        />

        <div className="p-6 lg:p-10 flex-1 space-y-10">

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Columna izquierda - Contenido principal */}
            <div className="lg:col-span-2 space-y-8">

              {/* Sección de Onboarding */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary">Plan de Onboarding</h2>
                  <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Para todos los empleados</span>
                </div>

                {visibleSteps.length > 0 ? (
                  visibleSteps.map((step) => {
                    const isDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done === true);
                    return (
                      <div key={step.id} className="bg-card border border-border rounded-[2rem] p-8 shadow-sm mb-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isDone ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                            <i className={`bi ${isDone ? 'bi-check-circle-fill' : 'bi-map-fill'}`}></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest">{step.badge || `Día ${step.day}`}</div>
                            <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{step.description}</p>

                        <div className="grid gap-3">
                          {step.onboardingTasks?.map((task: any) => {
                            const done = task.userProgress?.[0]?.done === true;
                            return (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id, done)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${done ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background border-border hover:border-secondary shadow-sm'}`}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-secondary border-secondary text-black' : 'border-border group-hover:border-secondary'}`}>
                                  {done && <i className="bi bi-check-lg text-xs font-bold"></i>}
                                </div>
                                <span className={`text-sm font-bold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {task.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                    <p className="text-muted-foreground font-medium">No hay pasos de onboarding disponibles.</p>
                  </div>
                )}
              </div>

              {/* Sección de Especializaciones (solo si hay) */}
              {specializationsData.length > 0 && (
                <div className="mt-12 pt-6 border-t-2 border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-purple-500">Especializaciones por Rol</h2>
                    <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Contenido específico para tu puesto</span>
                  </div>

                  {specializationsData.map((step, index) => {
                    const isDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done === true);
                    return (
                      <div key={step.id} className="bg-card border border-purple-500/30 rounded-[2rem] p-8 shadow-sm mb-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isDone ? 'bg-muted text-muted-foreground' : 'bg-purple-500/10 text-purple-500'}`}>
                            <i className={`bi ${isDone ? 'bi-check-circle-fill' : 'bi-star-fill'}`}></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                              Especialización {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{step.description}</p>

                        <div className="grid gap-3">
                          {step.onboardingTasks?.map((task: any) => {
                            const done = task.userProgress?.[0]?.done === true;
                            return (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id, done)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${done ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background border-border hover:border-purple-500 shadow-sm'}`}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-purple-500 border-purple-500 text-white' : 'border-border group-hover:border-purple-500'}`}>
                                  {done && <i className="bi bi-check-lg text-xs font-bold"></i>}
                                </div>
                                <span className={`text-sm font-bold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {task.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Columna derecha - Progreso y Formación */}
            <div className="space-y-10">
              {/* Progreso General */}
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Progreso General</h4>
                  <div className="text-xl">
                    <i className="bi bi-trophy-fill text-yellow-400"></i>
                  </div>
                </div>

                {/* Progreso Total en grande */}
                <div className="text-center mb-6">
                  <div className="text-6xl font-black text-foreground tracking-tighter mb-2">
                    {totalProgressPercent}%
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Completado total
                  </p>
                </div>

                {/* Separador */}
                <div className="border-t border-border my-6"></div>

                {/* Progreso Onboarding */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>Onboarding</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{completedTasks} de {totalTasks} tareas</p>
                </div>

                {/* Progreso Especializaciones */}
                {totalSpecializationTasks > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Especializaciones</span>
                      <span>{specializationProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${specializationProgress}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">{completedSpecializationTasks} de {totalSpecializationTasks} tareas</p>
                  </div>
                )}
              </div>

              {/* Formación */}
              <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Formación</h2>
                  <Link href="/dashboard/employee/courses" className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline">
                    Ver todos
                  </Link>
                </div>

                <div className="space-y-3">
                  {courses.slice(0, 4).map((course) => (
                    <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-2xl hover:border-secondary/50 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 bg-muted border border-border text-muted-foreground rounded-xl flex items-center justify-center group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <i className="bi bi-journal-text text-lg"></i>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-foreground text-sm font-bold truncate">{course.title}</p>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{course.isPublic ? "Campus EGM" : "Empresa"}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Soporte */}
              <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Soporte</p>
                <h5 className="font-bold text-sm mb-6 leading-snug text-foreground">¿Dudas con tu proceso de entrada?</h5>
                <button className="w-full bg-primary text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/10">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}