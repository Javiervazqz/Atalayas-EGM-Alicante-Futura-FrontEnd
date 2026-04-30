'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

// Definimos los destinos posibles para el auto-completado
const ROUTE_OPTIONS = [
  { label: "Manual (Sin acción)", value: "" },
  { label: "Documentos", value: "/dashboard/documents" },
  { label: "Cursos", value: "/dashboard/employee/courses" },
  { label: "Perfil", value: "/dashboard/profile" },
  { label: "Servicios", value: "/dashboard/employee/services" },
];

export default function OnboardingConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [steps, setSteps] = useState([
    {
      day: 1,
      title: "",
      description: "",
      tasks: [{ label: "", linkAction: "" }],
    },
  ]);

  // Cargar configuración actual
  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const response = await fetch(API_ROUTES.ONBOARDING.ME, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const formattedSteps = data.map((s: any) => ({
              day: s.day,
              title: s.title,
              description: s.description || "",
              tasks: s.onboardingTasks?.map((t: any) => ({
                label: t.label,
                linkAction: t.linkAction || "",
              })) || [{ label: "", linkAction: "" }],
            }));
            setSteps(formattedSteps);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  const addStep = () => {
    setSteps([
      ...steps,
      {
        day: steps.length + 1,
        title: "",
        description: "",
        tasks: [{ label: "", linkAction: "" }],
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, day: i + 1 }));
    setSteps(newSteps);
  };

  const addTask = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks.push({ label: "", linkAction: "" });
    setSteps(newSteps);
  };

  const updateTask = (stepIndex: number, taskIndex: number, field: "label" | "linkAction", value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks[taskIndex][field] = value;
    setSteps(newSteps);
  };

  const removeTask = (stepIndex: number, taskIndex: number) => {
    const newSteps = [...steps];
    if (newSteps[stepIndex].tasks.length > 1) {
      newSteps[stepIndex].tasks = newSteps[stepIndex].tasks.filter((_, i) => i !== taskIndex);
      setSteps(newSteps);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_ROUTES.ONBOARDING.SETUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ steps }),
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Configuración de Onboarding"
          description="Diseña el recorrido estratégico de bienvenida para los nuevos empleados."
          icon={<i className="bi bi-rocket-takeoff"></i>}
          backUrl="/dashboard/administrator/admin"
          action={
            <div className="flex items-center gap-4">
              {showSuccess && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-in fade-in">¡Guardado con éxito!</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-cloud-check"></i>}
                {saving ? "Guardando..." : "Guardar Plan"}
              </button>
            </div>
          }
        />

        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
          
          {steps.map((step, sIdx) => (
            <div key={sIdx} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Cabecera del Día */}
              <div className="p-6 lg:px-8 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-black uppercase leading-none opacity-70">Día</span>
                    <span className="text-xl font-bold leading-none">{step.day}</span>
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[sIdx].title = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Título de la jornada (ej: Primer contacto)"
                      className="bg-transparent border-none focus:ring-0 text-lg font-bold text-foreground placeholder:text-muted-foreground/30 w-full"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeStep(sIdx)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>

              {/* Contenido del Día */}
              <div className="p-6 lg:p-8 space-y-8">
                
                {/* Descripción opcional */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contexto del día</label>
                  <textarea 
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[sIdx].description = e.target.value;
                      setSteps(newSteps);
                    }}
                    placeholder="Describe brevemente el objetivo de este día..."
                    className="w-full bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl px-5 py-3 text-sm font-medium transition-all resize-none"
                    rows={2}
                  />
                </div>

                {/* Lista de Tareas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Checklist de tareas</label>
                  </div>

                  <div className="space-y-3">
                    {step.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="group flex flex-col md:flex-row gap-3 p-3 bg-muted/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
                        
                        {/* Input de la Tarea */}
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-background border border-input flex items-center justify-center text-muted-foreground/20 text-xs shrink-0"><i className="bi bi-check-lg"></i></div>
                          <input 
                            value={task.label}
                            onChange={(e) => updateTask(sIdx, tIdx, "label", e.target.value)}
                            placeholder={`Acción ${tIdx + 1}...`}
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-foreground placeholder:text-muted-foreground/40 w-full"
                          />
                        </div>

                        {/* Selector de Acción de Ruta */}
                        <div className="flex items-center gap-3">
                          <select 
                            value={task.linkAction}
                            onChange={(e) => updateTask(sIdx, tIdx, "linkAction", e.target.value)}
                            className="bg-background border border-input rounded-lg px-3 py-1.5 text-[11px] font-bold text-muted-foreground focus:border-primary outline-none transition-all cursor-pointer"
                          >
                            {ROUTE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={() => removeTask(sIdx, tIdx)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => addTask(sIdx)}
                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-all ml-1"
                  >
                    <i className="bi bi-plus-lg"></i> Añadir tarea
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Botón Añadir Día */}
          <button 
            onClick={addStep}
            className="w-full py-8 border-2 border-dashed border-border rounded-3xl text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
              <i className="bi bi-plus-lg text-xl"></i>
            </div>
            <span className="font-bold text-sm tracking-tight">Expandir plan de onboarding</span>
            <span className="text-[10px] uppercase font-medium opacity-50 tracking-widest">Siguiente día: {steps.length + 1}</span>
          </button>

        </div>
      </main>
    </div>
  );
}