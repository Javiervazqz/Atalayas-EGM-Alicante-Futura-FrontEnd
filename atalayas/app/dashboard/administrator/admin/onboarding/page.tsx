'use client';

import { useState, useEffect, useRef } from "react";
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
  type: "ONBOARDING" | "SPECIALIZATION";
  jobRole?: string;
}

type StepUpdateFields = keyof Pick<OnboardingStep, 'title' | 'description' | 'jobRole' | 'type'>;

const ROUTE_OPTIONS = [
  { label: "Manual (Sin acción)", value: "" },
  { label: "Documentos", value: "/dashboard/documents" },
  { label: "Cursos", value: "/dashboard/employee/courses" },
  { label: "Perfil", value: "/dashboard/profile" },
  { label: "Servicios", value: "/dashboard/employee/services" },
];

const DEFAULT_ROLES = ["Técnico", "Ventas", "Administrativo", "Gerente", "Operaciones"];

export default function OnboardingConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  // Refs para hacer scroll a nuevos elementos
  const newElementRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_ROUTES.ONBOARDING.ME, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            const formattedSteps: OnboardingStep[] = data.map((s: any) => ({
              day: s.day,
              title: s.title || "",
              description: s.description || "",
              tasks: s.onboardingTasks?.map((t: any) => ({
                label: t.label || "",
                linkAction: t.linkAction || "",
              })) || [{ label: "", linkAction: "" }],
              type: s.type === 'SPECIALIZATION' ? 'SPECIALIZATION' : 'ONBOARDING',
              jobRole: s.job_role || s.jobRole || "",
            }));
            setSteps(formattedSteps);
          } else {
            setSteps([{
              day: 1,
              title: "",
              description: "",
              tasks: [{ label: "", linkAction: "" }],
              type: "ONBOARDING",
            }]);
          }
        } else {
          setSteps([{
            day: 1,
            title: "",
            description: "",
            tasks: [{ label: "", linkAction: "" }],
            type: "ONBOARDING",
          }]);
        }

        await fetchAvailableRoles();
      } catch (error) {
        console.error("Error en fetchOnboarding:", error);
        setSteps([{
          day: 1,
          title: "",
          description: "",
          tasks: [{ label: "", linkAction: "" }],
          type: "ONBOARDING",
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  // Función para hacer scroll a un elemento
  const scrollToNewElement = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (newElementRef.current) {
        newElementRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 150);
  };

  const fetchAvailableRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_ROUTES.USERS.GET_ALL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAvailableRoles(data);
        }
      }
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  };

  // Calcular el próximo día disponible para onboarding
  const getNextOnboardingDay = () => {
    const onboardingSteps = steps.filter(step => step.type === "ONBOARDING");
    if (onboardingSteps.length === 0) return 1;
    let maxDay = 0;
    for (let i = 0; i < onboardingSteps.length; i++) {
      if (onboardingSteps[i].day > maxDay) {
        maxDay = onboardingSteps[i].day;
      }
    }
    return maxDay + 1;
  };

  const addStep = () => {
    const nextDay = getNextOnboardingDay();
    const newStep = {
      day: nextDay,
      title: "",
      description: "",
      tasks: [{ label: "", linkAction: "" }],
      type: "ONBOARDING" as const,
    };
    setSteps([...steps, newStep]);
    setTimeout(scrollToNewElement, 100);
  };

  const addSpecializationStep = () => {
    const newStep = {
      day: steps.length + 1,
      title: "",
      description: "",
      tasks: [{ label: "", linkAction: "" }],
      type: "SPECIALIZATION" as const,
      jobRole: "",
    };
    setSteps([...steps, newStep]);
    setTimeout(scrollToNewElement, 100);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    // Reordenar los días solo para onboarding
    let onboardingCounter = 1;
    const reorderedSteps = newSteps.map(s => {
      if (s.type === "ONBOARDING") {
        return { ...s, day: onboardingCounter++ };
      }
      return s;
    });
    setSteps(reorderedSteps);
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

  const updateStep = (sIdx: number, field: StepUpdateFields, value: string | "ONBOARDING" | "SPECIALIZATION") => {
    const newSteps = [...steps];
    if (field === "type") {
      newSteps[sIdx].type = value as "ONBOARDING" | "SPECIALIZATION";
      if (value === "ONBOARDING") {
        newSteps[sIdx].jobRole = undefined;
        // Recalcular días de onboarding
        let onboardingCounter = 1;
        for (let i = 0; i < newSteps.length; i++) {
          if (newSteps[i].type === "ONBOARDING") {
            newSteps[i].day = onboardingCounter++;
          }
        }
      } else if (value === "SPECIALIZATION" && !newSteps[sIdx].jobRole) {
        newSteps[sIdx].jobRole = "";
      }
    } else if (field === "jobRole") {
      newSteps[sIdx].jobRole = value as string;
    } else if (field === "title") {
      newSteps[sIdx].title = value as string;
    } else if (field === "description") {
      newSteps[sIdx].description = value as string;
    }
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ROUTES.ONBOARDING.SETUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ steps }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(error.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const onboardingSteps = steps.filter(step => step.type === "ONBOARDING");
  const specializationSteps = steps.filter(step => step.type === "SPECIALIZATION");

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Onboarding y Especializaciones"
          description="Diseña el plan de bienvenida y las rutas de especialización por roles."
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

            {/* Sección de Onboarding */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary">Plan de Onboarding</h2>
                <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Para todos los empleados</span>
              </div>

              <div className="space-y-6">
                {onboardingSteps.map((step, idx) => {
                  const originalIndex = steps.findIndex(s => s.day === step.day && s.type === step.type);
                  const isNew = originalIndex === steps.length - 1 && step.title === "" && step.description === "";
                  return (
                    <div
                      key={`onboarding-${step.day}-${idx}`}
                      ref={isNew ? newElementRef : null}
                    >
                      <StepCard
                        step={step}
                        stepNumber={idx + 1}
                        isSpecialization={false}
                        onUpdate={(field, value) => updateStep(originalIndex, field, value)}
                        onRemove={() => removeStep(originalIndex)}
                        onAddTask={() => addTask(originalIndex)}
                        onUpdateTask={(tIdx, field, value) => updateTask(originalIndex, tIdx, field, value)}
                        onRemoveTask={(tIdx) => removeTask(originalIndex, tIdx)}
                        availableRoles={availableRoles}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Especializaciones */}
            {specializationSteps.length > 0 && (
              <div className="mt-12 pt-6 border-t-2 border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-purple-500">Especializaciones por Rol</h2>
                  <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Contenido específico por puesto</span>
                </div>

                <div className="space-y-6">
                  {specializationSteps.map((step, idx) => {
                    const originalIndex = steps.findIndex(s => s.day === step.day && s.type === step.type);
                    const isNew = originalIndex === steps.length - 1 && step.title === "" && step.description === "";
                    return (
                      <div
                        key={`specialization-${step.day}-${idx}`}
                        ref={isNew ? newElementRef : null}
                      >
                        <StepCard
                          step={step}
                          stepNumber={idx + 1}
                          isSpecialization={true}
                          onUpdate={(field, value) => updateStep(originalIndex, field, value)}
                          onRemove={() => removeStep(originalIndex)}
                          onAddTask={() => addTask(originalIndex)}
                          onUpdateTask={(tIdx, field, value) => updateTask(originalIndex, tIdx, field, value)}
                          onRemoveTask={(tIdx) => removeTask(originalIndex, tIdx)}
                          availableRoles={availableRoles}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botones para añadir nuevo contenido */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={addStep}
                className="flex-1 py-8 border-2 border-dashed border-primary/30 rounded-3xl text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <i className="bi bi-plus-lg text-2xl group-hover:scale-110 transition-transform"></i>
                <span className="font-bold text-sm">Nuevo día de Onboarding</span>
                <span className="text-[9px] text-muted-foreground">Para todos los empleados</span>
              </button>

              <button
                onClick={addSpecializationStep}
                className="flex-1 py-8 border-2 border-dashed border-purple-500/30 rounded-3xl text-purple-500 hover:border-purple-500 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <i className="bi bi-star text-2xl group-hover:scale-110 transition-transform"></i>
                <span className="font-bold text-sm">Nueva Especialización</span>
                <span className="text-[9px] text-muted-foreground">Para un rol específico</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente StepCard
function StepCard({
  step,
  stepNumber,
  isSpecialization,
  onUpdate,
  onRemove,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  availableRoles
}: {
  step: OnboardingStep;
  stepNumber: number;
  isSpecialization: boolean;
  onUpdate: (field: StepUpdateFields, value: string | "ONBOARDING" | "SPECIALIZATION") => void;
  onRemove: () => void;
  onAddTask: () => void;
  onUpdateTask: (tIdx: number, field: keyof Task, value: string) => void;
  onRemoveTask: (tIdx: number) => void;
  availableRoles: string[];
}) {
  const cardColors = isSpecialization
    ? "border-purple-500/30 bg-gradient-to-br from-card to-purple-500/5"
    : "border-border bg-card";

  return (
    <div className={`rounded-3xl border ${cardColors} shadow-sm overflow-hidden`}>
      <div className={`p-4 md:p-6 border-b ${isSpecialization ? 'border-purple-500/20 bg-purple-500/5' : 'border-border bg-muted/20'} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm ${isSpecialization ? 'bg-purple-500 text-white' : 'bg-primary text-primary-foreground'}`}>
            {isSpecialization ? (
              <span className="text-lg font-bold leading-none">{stepNumber}</span>
            ) : (
              <>
                <span className="text-[8px] font-black uppercase leading-none opacity-70">Día</span>
                <span className="text-lg font-bold leading-none">{step.day}</span>
              </>
            )}
          </div>
          <input
            type="text"
            value={step.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder={isSpecialization ? "Título de la especialización..." : "Título de la jornada..."}
            className="bg-transparent border-none focus:ring-0 text-base md:text-lg font-bold text-foreground placeholder:text-muted-foreground/30 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdate("type", "ONBOARDING")}
              className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${!isSpecialization ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Onboarding
            </button>
            <button
              type="button"
              onClick={() => onUpdate("type", "SPECIALIZATION")}
              className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${isSpecialization ? 'bg-purple-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Especialización
            </button>
          </div>
          <button onClick={onRemove} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <i className="bi bi-trash3 text-lg"></i>
          </button>
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
          <textarea
            value={step.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            rows={2}
            placeholder="¿Qué pasará hoy?"
          />
        </div>

        {isSpecialization && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <i className="bi bi-briefcase-fill"></i>
              Rol requerido *
            </label>
            <select
              value={step.jobRole || ""}
              onChange={(e) => onUpdate("jobRole", e.target.value)}
              className="w-full bg-background border border-purple-500/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all cursor-pointer"
              required
            >
              <option value="">Seleccionar rol...</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="text-[9px] text-muted-foreground">
              Solo los empleados con este rol verán esta especialización
            </p>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tareas</label>
          <div className="space-y-3">
            {step.tasks.map((task, tIdx) => (
              <div key={tIdx} className="flex flex-col md:flex-row gap-3 p-3 bg-muted/40 rounded-2xl border border-border/50 group">
                <div className="flex items-center gap-3 flex-1">
                  <i className="bi bi-check2-circle text-muted-foreground/40 text-lg"></i>
                  <input
                    value={task.label}
                    onChange={(e) => onUpdateTask(tIdx, "label", e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full"
                    placeholder="Nombre de la tarea..."
                  />
                </div>
                <div className="flex items-center gap-2 pl-8 md:pl-0">
                  <select
                    value={task.linkAction}
                    onChange={(e) => onUpdateTask(tIdx, "linkAction", e.target.value)}
                    className="bg-background border border-input rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:border-primary"
                  >
                    {ROUTE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => onRemoveTask(tIdx)} className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors">
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
          >
            <i className="bi bi-plus-circle-fill"></i> Añadir tarea
          </button>
        </div>
      </div>
    </div>
  );
}