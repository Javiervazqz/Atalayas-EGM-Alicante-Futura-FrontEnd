"use client";

import { useState } from "react";

interface Step {
  day: number;
  title: string;
  tasks: string[];
}

export default function OnboardingPreview({ steps }: { steps: Step[] }) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // Solo contamos tareas que tengan texto real
  const allTasksCount = steps.reduce((acc, step) => 
    acc + step.tasks.filter(t => t && t.trim() !== '').length, 0
  );
  const doneCount = completedTasks.length;
  const progressPercent = allTasksCount > 0 ? Math.round((doneCount / allTasksCount) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row bg-[#F8FAFC] rounded-[32px] overflow-hidden border border-gray-200 h-[70vh] shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#F8FAFC]">
        <div className="mb-8">
          <span className="bg-[#005596] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Vista Previa de Usuario
          </span>
          <h2 className="text-2xl font-black text-[#1d1d1f] mt-4 tracking-tight">Tu Ruta de Incorporación</h2>
        </div>

        <div className="space-y-6">
          {steps.map((step, sIdx) => {
            // Si el día no tiene título ni tareas con texto, no lo mostramos en la preview
            const hasContent = step.title.trim() !== '' || step.tasks.some(t => t.trim() !== '');
            if (!hasContent) return null;

            return (
              <div key={`preview-step-${sIdx}`} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-[#d9ff00] text-[#005596]">
                    Día {step.day}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">{step.title || "Día sin título"}</h3>
                
                <div className="grid gap-2">
                  {step.tasks.map((task, tIdx) => {
                    if(!task || task.trim() === '') return null;
                    const taskId = `preview-task-${sIdx}-${tIdx}`;
                    const isDone = completedTasks.includes(taskId);
                    return (
                      <div
                        key={taskId}
                        onClick={() => toggleTask(taskId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isDone ? "bg-gray-50 border-transparent opacity-60" : "border-gray-50 bg-gray-50/50 hover:bg-white hover:border-[#d9ff00]"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? "bg-[#005596] border-[#005596]" : "border-gray-200"}`}>
                          {isDone && <span className="text-[#d9ff00] text-[10px]">✓</span>}
                        </div>
                        <span className={`text-sm font-bold ${isDone ? "text-gray-400 line-through" : "text-[#1d1d1f]"}`}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="w-full lg:w-72 bg-white border-l border-gray-100 p-8 flex flex-col gap-8 shrink-0">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso Global</h4>
          <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-black text-[#005596]">{progressPercent}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{doneCount} de {allTasksCount}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#d9ff00] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}