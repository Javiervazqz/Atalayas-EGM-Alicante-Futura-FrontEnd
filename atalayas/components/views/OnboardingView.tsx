"use client";

import React from "react";

interface OnboardingViewProps {
  onboardingData: any[];
  currentDay: number;
  handleToggleTask: (taskId: string, currentStatus: boolean, stepDay: number) => void;
  showSuccess: boolean;
  firstName: string;
}

export default function OnboardingView({
  onboardingData,
  currentDay,
  handleToggleTask,
  showSuccess,
  firstName,
}: OnboardingViewProps) {
  
  // Ordenar: Activos arriba, Completados abajo
  const visibleSteps = onboardingData.filter((s) => s.day <= currentDay);
  const activeSteps = visibleSteps.filter(s => !s.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done));
  const finishedSteps = visibleSteps.filter(s => s.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done));
  const sortedSteps = [...activeSteps, ...finishedSteps];

  return (
    <div className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-10 no-scrollbar relative">
      
      {/* ANIMACIÓN THUMBS UP (Dentro del componente para que sea autocontenido) */}
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[48px] shadow-2xl border border-white animate-in zoom-in duration-300 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-[#d9ff00] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(217,255,0,0.5)]">
              <span className="animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="#005596" viewBox="0 0 16 16">
                  <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                </svg>
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#005596] tracking-tight text-center">¡Día Completado!</h2>
          </div>
        </div>
      )}

      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight">¡Hola, {firstName}! 👋</h1>
        <p className="text-gray-500 mt-1 font-medium">
          Estás en tu <span className="font-black px-2 py-0.5 rounded-lg bg-[#d9ff00] text-[#005596]">Día {currentDay}</span> de incorporación.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xs font-black text-[#005596] uppercase tracking-[0.2em] mb-4">Tu Ruta de Bienvenida</h2>
        
        {sortedSteps.map((step) => {
          const isStepDone = step.onboardingTasks?.every((t: any) => t.userProgress?.[0]?.done);

          return (
            <div
              key={step.id}
              className={`transition-all duration-700 rounded-[32px] border p-8 ${
                isStepDone 
                ? "bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.8] scale-[0.98]" 
                : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  isStepDone ? "bg-gray-200 text-gray-400" : "bg-[#d9ff00] text-[#005596]"
                }`}>
                  {step.badge || `Día ${step.day}`}
                </span>
                {isStepDone && <span className="text-gray-400 text-[10px] font-bold">✓ COMPLETADO</span>}
              </div>

              <h3 className={`text-xl font-bold mb-1 ${isStepDone ? "text-gray-400" : "text-[#1d1d1f]"}`}>{step.title}</h3>
              <p className="text-gray-500 text-sm mb-6 font-medium">{step.description}</p>

              <div className="grid gap-3">
                {step.onboardingTasks?.map((task: any) => {
                  const isDone = task.userProgress?.[0]?.done || false;
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, isDone, step.day)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isDone ? "bg-white/50 border-transparent" : "bg-gray-50/50 border-gray-50 hover:bg-white hover:border-[#d9ff00]"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isDone ? "bg-[#005596] border-[#005596]" : "border-gray-200"
                      }`}>
                        {isDone && <span className="text-[#d9ff00] text-[10px]">✓</span>}
                      </div>
                      <span className={`text-sm font-bold ${isDone ? "text-gray-400 line-through" : "text-[#1d1d1f]"}`}>
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
  );
}