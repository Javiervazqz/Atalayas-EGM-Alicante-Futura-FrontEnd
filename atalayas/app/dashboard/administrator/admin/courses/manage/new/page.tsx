'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    isPublic: false,
    category: "BASICO",
    requiredRole: "",
    imageFile: null as File | null
  });

  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || '{"companyId": null}')
    : { companyId: null };

  // Cargar roles disponibles desde los empleados existentes
  useEffect(() => {
    const fetchAvailableRoles = async () => {
      setLoadingRoles(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_ROUTES.USERS.GET_ALL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAvailableRoles(Array.isArray(data) ? data : []);
        } else {
          setAvailableRoles(["Técnico", "Ventas", "Administrativo", "Gerente", "Operaciones"]);
        }
      } catch (err) {
        console.error("Error cargando roles:", err);
        setAvailableRoles(["Técnico", "Ventas", "Administrativo", "Gerente", "Operaciones"]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchAvailableRoles();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    // Validar que si es especialización, tenga un rol seleccionado
    if (formData.category === "ESPECIALIZADO" && !formData.requiredRole) {
      alert("Para cursos de especialización, debes seleccionar un rol requerido");
      return;
    }

    setLoading(true);
    setLoadingStep("Iniciando creación...");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay sesión iniciada");
      }

      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("isPublic", String(formData.isPublic));
      formDataToSend.append("category", formData.category);
      formDataToSend.append("companyId", user.companyId || "");

      if (formData.category === "ESPECIALIZADO" && formData.requiredRole) {
        formDataToSend.append("jobRole", formData.requiredRole);
      }

      if (formData.imageFile) {
        formDataToSend.append("file", formData.imageFile);
      }

      console.log("Enviando datos...");
      console.log("URL:", API_ROUTES.COURSES.CREATE);

      setLoadingStep("Creando curso...");
      const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!resCourse.ok) {
        const errorText = await resCourse.text();
        console.error("Error respuesta:", resCourse.status, errorText);
        throw new Error(`Error al crear el curso: ${resCourse.status}`);
      }

      const newCourse = await resCourse.json();
      console.log("Curso creado exitosamente:", newCourse);

      router.push("/dashboard/administrator/admin/courses/manage");

    } catch (err) {
      console.error("Error detallado:", err);
      alert(err instanceof Error ? err.message : "Error en el proceso de creación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <main className="flex-1 overflow-auto flex flex-col">
        <PageHeader
          title="Nuevo Curso"
          description="Crea un nuevo curso con imagen de portada y configuración de acceso."
          icon={<i className="bi bi-plus-circle-fill"></i>}
          backUrl="/dashboard/administrator/admin/courses/manage"
        />

        <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="bg-card p-8 lg:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8">

            {/* Imagen de portada */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Imagen de portada
              </label>
              <label className="relative h-40 w-full border-2 border-dashed rounded-2xl flex items-center justify-center transition-all cursor-pointer group overflow-hidden bg-muted/20 hover:border-primary">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="text-center text-white">
                        <i className="bi bi-camera text-2xl mb-1 block"></i>
                        <span className="text-[10px] font-bold">Cambiar imagen</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <i className="bi bi-image text-3xl text-muted-foreground mb-2 block"></i>
                    <p className="font-bold text-foreground text-sm">Seleccionar imagen</p>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, GIF hasta 5MB</p>
                  </div>
                )}
              </label>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nombre del curso
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all"
                placeholder="Ej: Prevención de Riesgos"
                disabled={loading}
                required
              />
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, category: 'BASICO', requiredRole: '' });
                }}
                className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.category === 'BASICO' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-muted/50 text-muted-foreground'}`}
                disabled={loading}
              >
                <i className="bi bi-book text-xl"></i>
                Onboarding
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.category === 'ESPECIALIZADO' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-muted/50 text-muted-foreground'}`}
                disabled={loading}
              >
                <i className="bi bi-mortarboard text-xl"></i>
                Especialización
              </button>
            </div>

            {/* Campo de Rol Requerido - Solo para especialización */}
            {formData.category === "ESPECIALIZADO" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Rol Requerido
                </label>
                <select
                  value={formData.requiredRole}
                  onChange={(e) => setFormData({ ...formData, requiredRole: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all appearance-none cursor-pointer"
                  disabled={loading || loadingRoles}
                  required={formData.category === "ESPECIALIZADO"}
                >
                  <option value="">Seleccionar rol...</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground ml-1">
                  Solo los empleados con este rol podrán ver y acceder al curso
                </p>
              </div>
            )}

            {/* Mensaje informativo para cursos de onboarding */}
            {formData.category === "BASICO" && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary text-center flex items-center justify-center gap-2">
                  <i className="bi bi-info-circle"></i>
                  Los cursos de Onboarding están disponibles para todos los empleados sin restricción de rol
                </p>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  {loadingStep}
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i>
                  Crear Curso
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}