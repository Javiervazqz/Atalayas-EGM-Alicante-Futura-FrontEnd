"use client";

import Sidebar from "@/components/ui/Sidebar";
import OnboardingPreview from "@/components/views/OnboardingPreview";
import { API_ROUTES } from "@/lib/utils";
import { useState, useEffect } from "react";

// Definimos los destinos posibles para el auto-completado
const ROUTE_OPTIONS = [
  { label: "Manual (Sin acción)", value: "" },
  { label: "Documentos", value: "/dashboard/documents" },
  { label: "Cursos", value: "/dashboard/employee/courses" },
  { label: "Perfil", value: "/dashboard/profile" },
  { label: "Servicios", value: "/dashboard/employee/services" },
];

interface CourseContent {
  id: string;
  title: string;
  order?: number;
}

interface Course {
  id: string;
  title: string;
  Content?: CourseContent[];
  content?: CourseContent[];
}

export default function OnboardingConfig() {
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([
    {
      day: 1,
      title: "",
      description: "",
      tasks: [{ label: "", linkAction: "" }],
    },
  ]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargamos los cursos al iniciar
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(API_ROUTES.COURSES.GET_ALL, {
          // Ajusta tu ruta de cursos
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          const sortedData = data.sort((a: any, b: any) => {
            // Quitamos espacios en blanco al principio/final para comparar limpio
            const titleA = a.title.trim().toLowerCase();
            const titleB = b.title.trim().toLowerCase();

            return titleA.localeCompare(titleB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
          setAvailableCourses(sortedData);
        }
      } catch (e) {
        console.error("Error cargando cursos", e);
      }
    };
    fetchCourses();
  }, []);

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
              // Adaptamos la carga del backend
              tasks: s.onboardingTasks?.map((t: any) => ({
                label: t.label,
                linkAction: t.linkAction || "",
              })) || [{ label: "", linkAction: "" }],
            }));
            setSteps(formattedSteps);
          }
        }
      } catch (error) {
        console.error("Error cargando onboarding:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  const fetchCourseDetail = async (courseId: string, taskId: string) => {
    const course = availableCourses.find((c) => c.id === courseId);
    if (course && (course.Content || course.content)) return;

    setLoadingLessons(taskId);
    try {
      const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(courseId), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const fullCourse = await res.json();
        setAvailableCourses((prev) =>
          prev.map((c) => (c.id === courseId ? fullCourse : c)),
        );
      }
    } catch (e) {
      console.error("Error cargando lecciones", e);
    } finally {
      setLoadingLessons(null);
    }
  };

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
    if (steps.length === 1) return; // No permitir borrar el último paso
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, day: i + 1 })); // Recalcular los días para que sean correlativos
    setSteps(newSteps);
  };

  const addTask = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks.push({ label: "", linkAction: "" });
    setSteps(newSteps);
  };

  const updateTask = (
    stepIndex: number,
    taskIndex: number,
    field: "label" | "linkAction",
    value: string,
  ) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tasks[taskIndex][field] = value;
    setSteps(newSteps);
  };

  const removeTask = (stepIndex: number, taskIndex: number) => {
    const newSteps = [...steps];
    if (newSteps[stepIndex].tasks.length > 1) {
      newSteps[stepIndex].tasks = newSteps[stepIndex].tasks.filter(
        (_, i) => i !== taskIndex,
      );
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, field: string, value: any) => {
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
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Se oculta tras 3 segundos
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  const stepsForPreview = steps.map((s) => ({
    ...s,
    onboardingTasks: s.tasks.map((t, idx) => ({
      id: idx.toString(),
      label: t.label,
    })),
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7] items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#005596]/10 border-t-[#005596] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 min-h-screen font-sans bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
             Configuración de Onboarding
           </h1>
           <p className="text-muted-foreground font-medium mt-1">Diseña el plan de bienvenida día a día.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-secondary text-secondary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          <i className="bi bi-save"></i> Guardar Plan
        </button>
      </header>

      {steps.map((step, sIdx) => (
        <div
          key={sIdx}
          className="relative bg-card rounded-3xl shadow-sm border border-border p-6 lg:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <button
            onClick={() => removeStep(sIdx)}
            type="button"
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Eliminar día"
          >
            <i className="bi bi-trash3 text-lg"></i>
          </button>

          <div className="flex flex-col sm:flex-row gap-6 mb-8 pr-10">
            <div className="sm:w-20">
              <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-1">
                Día
              </label>
              <div className="text-4xl font-extrabold text-foreground">{step.day}</div>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Título de la jornada
              </label>
              <input
                type="text"
                value={step.title}
                className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-base font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/50 placeholder:font-medium"
                onChange={(e) => updateStep(sIdx, "title", e.target.value)}
                placeholder="Ej: Bienvenida y herramientas básicas..."
              />
            </div>
          </div>
          
          <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
            <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <i className="bi bi-ui-checks"></i> Checklist de tareas
            </label>
            <div className="space-y-3">
               {step.tasks.map((task, tIdx) => (
                 <div key={tIdx} className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-md bg-background border border-input flex items-center justify-center text-muted-foreground/30 text-xs shrink-0"><i className="bi bi-check-lg"></i></div>
                   <input
                     value={task}
                     placeholder={`Tarea ${tIdx + 1}...`}
                     className="flex-1 bg-background px-4 py-2.5 rounded-xl text-sm border border-input focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                     onChange={(e) => {
                       const newSteps = [...steps];
                       newSteps[sIdx].tasks[tIdx] = e.target.value;
                       setSteps(newSteps);
                     }}
                   />
                 </div>
               ))}
            </div>
            <button
              onClick={() => addTask(sIdx)}
              className="text-xs text-primary font-bold flex items-center gap-1.5 mt-4 hover:opacity-80 transition-opacity bg-primary/10 px-4 py-2 rounded-lg inline-flex"
            >
              <i className="bi bi-plus-lg"></i> Añadir tarea
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addStep}
        className="w-full py-6 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold hover:text-foreground hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm"
      >
        <i className="bi bi-plus-circle-fill text-lg"></i> Añadir un nuevo día al Onboarding
      </button>
    </div>
  );
}