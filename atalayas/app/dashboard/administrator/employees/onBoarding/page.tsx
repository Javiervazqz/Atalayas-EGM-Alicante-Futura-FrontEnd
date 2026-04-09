"use client";

import { API_ROUTES } from "@/lib/utils";
import { useState } from "react";

export default function OnboardingConfig() {
  const [steps, setSteps] = useState([
    { day: 1, title: "", description: "", tasks: [""] },
  ]);

  const addStep = () => {
    setSteps([
      ...steps,
      { day: steps.length + 1, title: "", description: "", tasks: [""] },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const addTask = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks.push("");
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_ROUTES.ONBOARDING.SETUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ steps }),
      });
      if (response.ok) alert("¡Plan guardado con éxito!");
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Configuración de Onboarding
        </h1>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Guardar Cambios
        </button>
      </header>

      {steps.map((step, sIdx) => (
        <div
          key={sIdx}
          className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          style={{ position: "relative" }} // Refuerzo manual del ancla
        >
          {/* EL BOTÓN FUERA DE TODO FLEX */}
          <button
            onClick={() => removeStep(sIdx)}
            type="button"
            className="absolute"
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              zIndex: 50,
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              className="text-gray-300 hover:text-red-600 transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>

          {/* EL CONTENIDO VIENE DESPUÉS */}
          <div className="flex gap-4 mb-6 pr-10">
            <div className="w-16">
              <label className="block text-xs font-bold text-gray-400 uppercase">
                Día
              </label>
              <div className="text-lg font-bold text-gray-700">{step.day}</div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">
                Título
              </label>
              <input
                type="text"
                value={step.title}
                className="w-full border-b py-1 outline-none focus:border-blue-500"
                onChange={(e) => updateStep(sIdx, "title", e.target.value)}
                placeholder="Título del día..."
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Checklist de tareas
            </label>
            {step.tasks.map((task, tIdx) => (
              <input
                key={tIdx}
                value={task}
                placeholder="Escribe una tarea..."
                className="w-full bg-gray-50 px-4 py-2 rounded-lg text-sm border border-transparent focus:border-blue-200 focus:bg-white outline-none transition"
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[sIdx].tasks[tIdx] = e.target.value;
                  setSteps(newSteps);
                }}
              />
            ))}
            <button
              onClick={() => addTask(sIdx)}
              className="text-sm text-blue-600 font-bold flex items-center gap-1 mt-2 hover:text-blue-800"
            >
              + Añadir tarea
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addStep}
        className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-white transition font-medium"
      >
        + Añadir un nuevo día al Onboarding
      </button>
    </div>
  );
}
