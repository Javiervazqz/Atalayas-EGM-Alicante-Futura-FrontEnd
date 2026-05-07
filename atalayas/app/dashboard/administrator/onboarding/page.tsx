'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

// --- Tipos ---
interface Task {
  label: string;
  linkAction: string;
}

interface OnboardingStep {
  day: number;
  title: string;
  description: string;
  tasks: Task[];
}

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
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      day: 1,
      title: "",
      description: "",
      tasks: [{ label: "", linkAction: "" }],
    },
  ]);

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
    setSteps([...steps, { day: steps.length + 1, title: "", description: "", tasks: [{ label: "", linkAction: "" }] }]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, day: i + 1 })));
  };

  const addTask = (sIdx: number) => {
    const newSteps = [...steps];
    newSteps[sIdx].tasks.push({ label: "", linkAction: "" });
    setSteps(newSteps);
  };

  const updateTask = (sIdx: number, tIdx: number, field: keyof Task, value: string) => {
    const newSteps = [...steps];
    newSteps[sIdx].tasks[tIdx][field] = value;
    setSteps(newSteps);
  };

  const removeTask = (sIdx: number, tIdx: number) => {
    const newSteps = [...steps];
    if (newSteps[sIdx].tasks.length > 1) {
      newSteps[sIdx].tasks = newSteps[sIdx].tasks.filter((_, i) => i !== tIdx);
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
      alert("Error al guardar");
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader 
          title="Onboarding"
          description="Diseña el plan de bienvenida."
          icon={<i className="bi bi-rocket-takeoff"></i>}
          backUrl="/dashboard/administrator/admin"
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {showSuccess && (
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center sm:text-right animate-in fade-in zoom-in-95">
                  ¡Guardado con éxito!
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
              >
                {saving ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-cloud-check"></i>}
                <span>{saving ? "Guardando..." : "Guardar Plan"}</span>
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
            
            {steps.map((step, sIdx) => (
              <div key={sIdx} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Cabecera Día */}
                <div className="p-4 md:p-6 border-b border-border bg-muted/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-[8px] font-black uppercase leading-none opacity-70">Día</span>
                      <span className="text-lg font-bold leading-none">{step.day}</span>
                    </div>
                    <input 
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[sIdx].title = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Título de la jornada..."
                      className="bg-transparent border-none focus:ring-0 text-base md:text-lg font-bold text-foreground placeholder:text-muted-foreground/30 w-full"
                    />
                  </div>
                  <button onClick={() => removeStep(sIdx)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <i className="bi bi-trash3 text-lg"></i>
                  </button>
                </div>

                {/* Cuerpo Día */}
                <div className="p-5 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
                    <textarea 
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[sIdx].description = e.target.value;
                        setSteps(newSteps);
                      }}
                      className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                      rows={2}
                      placeholder="¿Qué pasará hoy?"
                    />
                  </div>

                  {/* Tareas */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tareas</label>
                    <div className="space-y-3">
                      {step.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex flex-col md:flex-row gap-3 p-3 bg-muted/40 rounded-2xl border border-border/50 group">
                          <div className="flex items-center gap-3 flex-1">
                            <i className="bi bi-check2-circle text-muted-foreground/40 text-lg"></i>
                            <input 
                              value={task.label}
                              onChange={(e) => updateTask(sIdx, tIdx, "label", e.target.value)}
                              className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full"
                              placeholder="Nombre de la tarea..."
                            />
                          </div>
                          <div className="flex items-center gap-2 pl-8 md:pl-0">
                            <select 
                              value={task.linkAction}
                              onChange={(e) => updateTask(sIdx, tIdx, "linkAction", e.target.value)}
                              className="bg-background border border-input rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:border-primary"
                            >
                              {ROUTE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <button onClick={() => removeTask(sIdx, tIdx)} className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors">
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => addTask(sIdx)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
                    >
                      <i className="bi bi-plus-circle-fill"></i> Añadir tarea
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={addStep}
              className="w-full py-10 border-2 border-dashed border-border rounded-3xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <i className="bi bi-plus-lg text-2xl group-hover:scale-110 transition-transform"></i>
              <span className="font-bold text-sm">Nuevo día de onboarding</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}