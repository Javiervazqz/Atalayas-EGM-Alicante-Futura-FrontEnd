'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeDashboard() {
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [currentDay, setCurrentDay] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);

      const referenceDateRaw = storedUser.firstLoginAt;

      if (referenceDateRaw || storedUser.createdAt) {
        const referenceDate = new Date(storedUser.createdAt);
        const today = new Date();
        const start = new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth(),
          referenceDate.getDate(),
        );
        const end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setCurrentDay(diffDays > 0 ? diffDays : 1);
      }
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resCourses, resOnboarding] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.ONBOARDING.ME, { headers }),
        ]);

        const dataCourses = await resCourses.json();
        const dataOnboarding = await resOnboarding.json();
        const sortedDataCourses = dataCourses.sort((a: any, b: any) => {
          // Quitamos espacios en blanco al principio/final para comparar limpio
          const titleA = a.title.trim().toLowerCase();
          const titleB = b.title.trim().toLowerCase();

          return titleA.localeCompare(titleB, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });

        setCourses(Array.isArray(sortedDataCourses) ? dataCourses : []);
        setOnboardingData(Array.isArray(dataOnboarding) ? dataOnboarding : []);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
  }, []);

  const handleToggleTask = async (
    taskId: string,
    currentStatus: boolean,
    stepDay: number,
  ) => {
    const newStatus = !currentStatus;

    const updatedData = onboardingData.map((step) => ({
      ...step,
      onboardingTasks: step.onboardingTasks.map((task: any) =>
        task.id === taskId ? { ...task, userProgress: [{ done: newStatus }] } : task,
      ),
    }));
    setOnboardingData(updatedData);

    try {
      const token = localStorage.getItem("token");
      await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, done: newStatus }),
      });

      if (newStatus) {
        const currentStep = updatedData.find((s) => s.day === stepDay);
        const isNowFinished = currentStep.onboardingTasks.every((t: any) => t.userProgress?.[0]?.done);
        if (isNowFinished) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.error("Error al actualizar tarea:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
        <Sidebar role="EMPLOYEE" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#005596]/10 border-t-[#005596] rounded-full animate-spin"></div>
            <div className="absolute w-4 h-4 bg-[#d9ff00] rounded-full shadow-[0_0_15px_rgba(217,255,0,0.8)]"></div>
          </div>
          <p className="mt-6 text-[#005596] font-black text-xs uppercase tracking-[0.3em] animate-pulse">
            Cargando tus datos...
          </p>
        </div>
      </div>
    );
  }

  const firstName = user?.name || user?.email?.split("@")[0] || "Empleado";

  const visibleSteps = onboardingData.filter((s) => s.day <= currentDay);
  const activeSteps = visibleSteps.filter(
    (step) =>
      !step.onboardingTasks?.every((task: any) => task.userProgress?.[0]?.done),
  );
  const completedSteps = visibleSteps.filter(
    (step) =>
      step.onboardingTasks?.length > 0 &&
      step.onboardingTasks.every((task: any) => task.userProgress?.[0]?.done),
  );

  const sortedSteps = [...activeSteps, ...completedSteps];

  const allTasks = visibleSteps.flatMap((s) => s.onboardingTasks || []);
  const completedTasks = allTasks.filter(
    (t) => t.userProgress?.[0]?.done,
  ).length;
  const progressPercent =
    allTasks.length > 0
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;

  const maxOnboardingDay =
    onboardingData.length > 0
      ? Math.max(...onboardingData.map((s) => s.day))
      : 0;

  const hasPendingTasks = onboardingData.some(step =>
    step.onboardingTasks?.some((task:any) => !task.userProgress?.[0]?.done)
  );
  
  const isOnboardingFinished =
    currentDay > maxOnboardingDay && maxOnboardingDay > 0 && !hasPendingTasks;

  let visibleDay = currentDay;
  if(currentDay > maxOnboardingDay){
    visibleDay = maxOnboardingDay
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />

      {/* ANIMACIÓN THUMBS UP - MÁS ELEGANTE */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-background/50 backdrop-blur-sm">
          <div className="bg-card p-12 rounded-[3rem] shadow-2xl border border-border animate-in zoom-in duration-300 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
              <span className="animate-bounce text-5xl">
                <i className="bi bi-check-circle-fill"></i>
              </span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                ¡Día Completado!
              </h2>
              <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                Sigue así, vas por buen camino
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-10 no-scrollbar">
          
          {/* BANNER DE BIENVENIDA COMPACTO */}
          <header className="bg-white rounded-[2rem] p-8 mb-10 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                ¡Hola, {firstName}!
              </h1>
              <div className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
                {isOnboardingFinished ? (
                  <>
                    <span className="font-black px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">
                      Onboarding Completado
                    </span>
                    <span className="text-primary font-bold text-sm">
                      ¡Bienvenido al equipo!
                    </span>
                  </>
                ) : (
                  <>
                    Estás en tu{" "}
                    <span className="font-black px-2 py-0.5 rounded-lg bg-secondary/20 text-secondary border border-secondary/30">
                      Día {visibleDay}
                    </span>{" "}
                    de incorporación.
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setCurrentDay((prev) => prev + 1)}
              className="bg-muted text-muted-foreground text-[10px] font-black px-3 py-2 rounded-lg hover:bg-border transition-all"
            >
              SIMULAR DÍA
            </button>
          </header>

          <section className="space-y-6 mb-12">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">
              Tu Ruta de Incorporación
            </h2>

            {sortedSteps.length === 0 && !loading && (
              <div className="p-10 border-2 border-dashed border-border rounded-[2rem] text-center text-muted-foreground">
                No hay pasos configurados para hoy.
              </div>
            )}

            {sortedSteps.map((step) => {
              const isStepDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done);
              return (
                <div
                  key={step.id}
                  className={`transition-all duration-700 rounded-[2rem] border p-8 shadow-sm ${
                    isStepDone
                      ? "bg-muted/30 border-border opacity-70 grayscale-[0.5] scale-[0.98]"
                      : "bg-card border-border hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isStepDone
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {step.badge || `Día ${step.day}`}
                    </span>
                    {isStepDone && (
                      <span className="text-muted-foreground text-[10px] font-bold">
                        ✓ BLOQUE FINALIZADO
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-2 ${isStepDone ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 font-medium">
                    {step.description}
                  </p>

                  <div className="grid gap-3">
                    {step.onboardingTasks?.map((task: any) => {
                      const isDone = task.userProgress?.[0]?.done || false;
                      const getCorrectUrl = () => {
                        if (!task.linkAction) return "#";
                        const urlParts = task.linkAction.split('?');
                        if (urlParts.length > 1) {
                          const params = new URLSearchParams(urlParts[1]);
                          const cId = params.get('courseId');
                          const contId = params.get('contentId');
                          if (cId && contId) return `/dashboard/employee/courses/${cId}/content/${contId}?fromTask=${task.id}`;
                          if (cId) return `/dashboard/employee/courses/${cId}?fromTask=${task.id}`;
                        }
                        return `${task.linkAction}${task.linkAction.includes('?') ? '&' : '?'}fromTask=${task.id}`;
                      };

                      return (
                        <div
                          key={task.id}
                          onClick={() =>
                            handleToggleTask(task.id, isDone, step.day)
                          }
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group cursor-pointer ${
                            isDone
                              ? "bg-background/50 border-transparent"
                              : "border-border bg-muted/30 hover:bg-card hover:border-secondary shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isDone
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input group-hover:border-secondary bg-background"
                            }`}
                          >
                            {isDone && (
                              <i className="bi bi-check text-sm font-bold"></i>
                            )}
                          </div>
                          <span
                            className={`text-sm font-semibold transition-colors ${isDone ? "text-muted-foreground line-through opacity-70" : "text-foreground"}`}
                          >
                            {task.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* SIDEBAR DERECHA - ESTADÍSTICAS */}
        <aside className="w-full md:w-80 h-screen border-l border-border bg-card p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Progreso Global
            </h4>
            <div className="bg-muted/50 rounded-3xl p-5 border border-border">
              <div className="flex justify-between items-end mb-3">
                <span className="text-2xl font-black text-primary">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {completedTasks} de {allTasks.length}
                </span>
              </div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em]">
                Formación Recomendada
              </h2>
            </div>

            <div className="grid gap-3">
              {loading ? (
                <div className="h-20 bg-muted animate-pulse rounded-2xl" />
              ) : (
                courses.slice(0, 5).map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/employee/courses/${course.id}`}
                  >
                    <div className="bg-background p-4 rounded-2xl border border-border hover:border-secondary transition-all group shadow-sm">
                      <h4 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary line-clamp-1 transition-colors">
                        {course.title}
                      </h4>

                      <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {course.isPublic ? "EGM" : "Privado"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}