"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";

export default function EmployeeDashboard() {
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [currentDay, setCurrentDay] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false); // Para el Thumbs Up

  // 1. Carga de datos iniciales
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);

      const referenceDateRaw = storedUser.firstLoginAt

      if (referenceDateRaw) {
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

        setCourses(Array.isArray(dataCourses) ? dataCourses : []);
        setOnboardingData(Array.isArray(dataOnboarding) ? dataOnboarding : []);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Función para marcar/desmarcar tareas (Toggle)
  const handleToggleTask = async (
    taskId: string,
    currentStatus: boolean,
    stepDay: number,
  ) => {
    const newStatus = !currentStatus;

    // Update Optimista en el UI
    const updatedData = onboardingData.map((step) => ({
      ...step,
      onboardingTasks: step.onboardingTasks.map((task: any) =>
        task.id === taskId
          ? { ...task, userProgress: [{ done: newStatus }] }
          : task,
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

      // Si marcamos como hecho, verificamos si se completó el bloque
      if (newStatus) {
        const currentStep = updatedData.find((s) => s.day === stepDay);
        const isNowFinished = currentStep.onboardingTasks.every(
          (t: any) => t.userProgress?.[0]?.done,
        );

        if (isNowFinished) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.error("Error al actualizar tarea:", err);
    }
  };

  // Helpers de datos
  const firstName = user?.name || user?.email?.split("@")[0] || "Empleado";

  // Lógica de filtrado y ordenamiento (Activos arriba, Completados abajo en gris)
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

  // Cálculos de progreso
  const allTasks = visibleSteps.flatMap((s) => s.onboardingTasks || []);
  const completedTasks = allTasks.filter(
    (t) => t.userProgress?.[0]?.done,
  ).length;
  const progressPercent =
    allTasks.length > 0
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;

  // Buscamos cuál es el día más alto que existe en las tareas (ej: Día 5)
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role="EMPLOYEE" />

      {/* ANIMACIÓN THUMBS UP */}
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white animate-in zoom-in duration-300 flex flex-col items-center gap-6">
            {/* El círculo ahora es el protagonista en amarillo flúor */}
            <div className="w-24 h-24 bg-[#d9ff00] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(217,255,0,0.5)]">
              <span className="animate-bounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="52"
                  height="52"
                  fill="#005596"
                  viewBox="0 0 16 16"
                >
                  <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                </svg>
              </span>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black text-[#005596] tracking-tight">
                ¡Día Completado!
              </h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                Sigue así, vas por buen camino
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-10 no-scrollbar">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight">
                ¡Hola, {firstName}!
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                {isOnboardingFinished ? (
                  <div className="flex items-center gap-2">
                    <p className="font-black px-2 py-0.5 rounded-lg bg-[#005596] text-white text-xs uppercase tracking-wider">
                      Onboarding Completado
                    </p>
                    <p className="text-[#005596] font-bold">
                      ¡Bienvenido al equipo!
                    </p>
                  </div>
                ) : (
                  <>
                    Estás en tu{" "}
                    <span className="font-black px-2 py-0.5 rounded-lg bg-[#d9ff00] text-[#005596]">
                      Día {visibleDay}
                    </span>{" "}
                    de incorporación.
                  </>
                )}
              </p>
            </div>

            {/* Botón de Debug - Solo para desarrollo */}
            <button
              onClick={() => setCurrentDay((prev) => prev + 1)}
              className="bg-gray-100 text-gray-400 text-[10px] font-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-all"
            >
              SIMULAR PASO DEL TIEMPO
            </button>
          </header>

          <section className="space-y-6 mb-12">
            <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em] mb-4">
              Tu Ruta de Incorporación
            </h2>

            {sortedSteps.length === 0 && !loading && (
              <div className="p-10 border-2 border-dashed border-gray-200 rounded-[32px] text-center text-gray-400">
                No hay pasos configurados para hoy.
              </div>
            )}

            {sortedSteps.map((step) => {
              const isStepDone = step.onboardingTasks?.every(
                (t: any) => t.userProgress?.[0]?.done,
              );

              return (
                <div
                  key={step.id}
                  className={`transition-all duration-700 rounded-[32px] border p-8 shadow-sm ${
                    isStepDone
                      ? "bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.8] scale-[0.98]"
                      : "bg-white border-gray-100 hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isStepDone
                          ? "bg-gray-200 text-gray-400"
                          : "bg-[#d9ff00] text-[#005596]"
                      }`}
                    >
                      {step.badge || `Día ${step.day}`}
                    </span>
                    {isStepDone && (
                      <span className="text-gray-400 text-[10px] font-bold">
                        ✓ BLOQUE FINALIZADO
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-1 ${isStepDone ? "text-gray-400" : "text-[#1d1d1f]"}`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 font-medium">
                    {step.description}
                  </p>

                  <div className="grid gap-3">
                    {step.onboardingTasks?.map((task: any) => {
                      const isDone = task.userProgress?.[0]?.done || false;
                      return (
                        <div
                          key={task.id}
                          onClick={() =>
                            handleToggleTask(task.id, isDone, step.day)
                          }
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group cursor-pointer ${
                            isDone
                              ? "bg-white/50 border-transparent"
                              : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-[#d9ff00]"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isDone
                                ? "bg-[#005596] border-[#005596]"
                                : "border-gray-200 group-hover:border-[#d9ff00]"
                            }`}
                          >
                            {isDone && (
                              <span className="text-[#d9ff00] text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm font-bold ${isDone ? "text-gray-400 line-through" : "text-[#1d1d1f]"}`}
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

        <aside className="w-full md:w-80 h-screen border-l border-gray-100 bg-white p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Progreso Global
            </h4>
            <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-[#005596]">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {completedTasks} de {allTasks.length}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d9ff00] rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em]">
                Formación Recomendada
              </h2>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
              ) : (
                courses.slice(0, 5).map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/employee/courses/${course.id}`}
                  >
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#d9ff00] transition-all group">
                      <h4 className="font-bold text-[#1d1d1f] text-xs mb-1 group-hover:text-[#005596] line-clamp-1">
                        {course.title}
                      </h4>

                      <span className="text-[9px] font-black uppercase text-[#005596] bg-blue-50 px-2 py-0.5 rounded">
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
