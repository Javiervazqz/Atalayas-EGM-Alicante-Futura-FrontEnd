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

  const handleToggleTask = async (taskId: string, currentStatus: boolean, stepDay: number) => {
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
  const activeSteps = visibleSteps.filter(step => !step.onboardingTasks?.every((task: any) => task.userProgress?.[0]?.done));
  const completedSteps = visibleSteps.filter(step => step.onboardingTasks?.length > 0 && step.onboardingTasks.every((task: any) => task.userProgress?.[0]?.done));
  const sortedSteps = [...activeSteps, ...completedSteps];

  const allTasks = visibleSteps.flatMap((s) => s.onboardingTasks || []);
  const completedTasks = allTasks.filter((t) => t.userProgress?.[0]?.done).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const maxOnboardingDay = onboardingData.length > 0 ? Math.max(...onboardingData.map((s) => s.day)) : 0;
  const visibleDay = currentDay > maxOnboardingDay ? maxOnboardingDay : currentDay;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />

      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white animate-in zoom-in duration-300 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-[#d9ff00] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(217,255,0,0.5)]">
              <span className="text-3xl animate-bounce">👍</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#005596] tracking-tight">¡Día Completado!</h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Sigue así, vas por buen camino</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-10 no-scrollbar">
          
          {/* BANNER DE BIENVENIDA COMPACTO */}
          <header className="bg-white rounded-[2rem] p-8 mb-10 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight">¡Hola, <span className="text-blue-600">{user.name}</span>!</h1>
              <p className="text-gray-500 mt-1 font-medium">
                Estás en tu <span className="font-black px-2 py-0.5 rounded-lg bg-[#d9ff00] text-[#005596]">Día {visibleDay}</span> de incorporación.
              </p>
            </div>
            <button onClick={() => setCurrentDay((prev) => prev + 1)} className="bg-gray-100 text-gray-400 text-[10px] font-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-all">DEBUG +1 DIA</button>
          </header>

          <section className="space-y-6 mb-12">
            <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em] mb-4 ml-2">Tu Ruta de Incorporación</h2>
            {sortedSteps.map((step) => {
              const isStepDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done);
              return (
                <div key={step.id} className={`transition-all duration-700 rounded-[32px] border p-8 shadow-sm ${isStepDone ? "bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.8] scale-[0.98]" : "bg-white border-gray-100 hover:shadow-md animate-in fade-in slide-in-from-bottom-4"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isStepDone ? "bg-gray-200 text-gray-400" : "bg-[#d9ff00] text-[#005596]"}`}>{step.badge || `Día ${step.day}`}</span>
                    {isStepDone && <span className="text-gray-400 text-[10px] font-bold">✓ BLOQUE FINALIZADO</span>}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${isStepDone ? "text-gray-400" : "text-[#1d1d1f]"}`}>{step.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">{step.description}</p>
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
                        <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${isDone ? "bg-white/50 border-transparent" : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-[#d9ff00]"}`}>
                          <div 
                            onClick={() => handleToggleTask(task.id, isDone, step.day)} 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? "bg-[#005596] border-[#005596]" : "border-gray-200 group-hover:border-[#d9ff00]"}`}>
                              {isDone && <span className="text-[#d9ff00] text-[10px]">✓</span>}
                            </div>
                            <span className={`text-sm font-bold ${isDone ? "text-gray-400 line-through" : "text-[#1d1d1f]"}`}>
                              {task.label}
                            </span>
                          </div>

                          {task.linkAction && !isDone && (
  <Link 
    href={getCorrectUrl()}
    className="ml-4 group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-blue-50"
  >
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#005596] transition-colors">
      Ir
    </span>
    <i className="bi bi-chevron-right text-[10px] text-gray-300 group-hover:text-[#005596] group-hover:translate-x-0.5 transition-all"></i>
  </Link>
)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="w-full md:w-80 h-screen border-l border-gray-100 bg-white p-8 flex flex-col gap-8 shrink-0 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Progreso Global</h4>
            <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-[#005596]">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{completedTasks} de {allTasks.length}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#d9ff00] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <section>
            <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em] mb-6">Formación Recomendada</h2>
            <div className="grid gap-4">
              {courses.slice(0, 5).map((course) => (
                <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`}>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#d9ff00] transition-all group">
                    <h4 className="font-bold text-[#1d1d1f] text-xs mb-1 group-hover:text-[#005596] line-clamp-1">{course.title}</h4>
                    <span className="text-[9px] font-black uppercase text-[#005596] bg-blue-50 px-2 py-0.5 rounded">{user?.company?.name || "Empresa"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}