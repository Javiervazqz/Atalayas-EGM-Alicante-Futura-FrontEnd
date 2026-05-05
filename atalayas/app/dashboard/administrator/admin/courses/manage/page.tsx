"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import Link from "next/link";
import { API_ROUTES } from "@/lib/utils";

export default function ManageCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "BASICO" | "ESPECIALIZADO">("ALL");

  // Estados para Eliminación
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estados para Edición
  const [courseToEdit, setCourseToEdit] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  // Estados para Roles
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAvailableRoles();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles disponibles desde los empleados existentes
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
        console.error("Error cargando roles:", res.status);
        // Si el endpoint no existe, usar roles por defecto
        setAvailableRoles(["Técnico", "Ventas", "Administrativo", "Gerente", "Operaciones"]);
      }
    } catch (err) {
      console.error("Error cargando roles:", err);
      setAvailableRoles(["Técnico", "Ventas", "Administrativo", "Gerente", "Operaciones"]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_ROUTES.COURSES.GET_ALL}/${courseToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(courses.filter((c) => c.id !== courseToDelete));
      setCourseToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que si es especialización, tenga un rol seleccionado
    if (courseToEdit.category === "ESPECIALIZADO" && !courseToEdit.requiredRole) {
      alert("Para cursos de especialización, debes seleccionar un rol requerido");
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");

      // 🔥 CORREGIDO: Usar 'jobRole' en lugar de 'requiredRole'
      const payload: any = {
        title: courseToEdit.title,
        category: courseToEdit.category,
      };

      // Solo incluir jobRole si es especialización
      if (courseToEdit.category === "ESPECIALIZADO") {
        payload.jobRole = courseToEdit.requiredRole;
      } else {
        payload.jobRole = null;
      }

      // Si hay una nueva imagen, usamos FormData
      if (courseToEdit.newImageFile) {
        const formData = new FormData();
        formData.append("title", courseToEdit.title);
        formData.append("category", courseToEdit.category);
        if (courseToEdit.category === "ESPECIALIZADO") {
          formData.append("jobRole", courseToEdit.requiredRole);
        }
        formData.append("file", courseToEdit.newImageFile);

        const res = await fetch(API_ROUTES.COURSES.UPDATE(courseToEdit.id), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        });

        if (res.ok) {
          const result = await res.json();
          setCourses(courses.map(c => c.id === courseToEdit.id ? (result.data || result) : c));
          setCourseToEdit(null);
        } else {
          const errorData = await res.json();
          alert(`Error: ${errorData.message || "No se pudo actualizar"}`);
        }
      } else {
        // Sin imagen, usamos JSON
        const res = await fetch(API_ROUTES.COURSES.UPDATE(courseToEdit.id), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const result = await res.json();
          setCourses(courses.map(c => c.id === courseToEdit.id ? (result.data || result) : c));
          setCourseToEdit(null);
        } else {
          const errorData = await res.json();
          alert(`Error: ${errorData.message || "No se pudo actualizar"}`);
        }
      }
    } catch (err) {
      console.error("Error en el Patch:", err);
      alert("Error al actualizar el curso");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesTab = true;
    if (filter === "BASICO") matchesTab = c.category?.toUpperCase() !== "ESPECIALIZADO";
    if (filter === "ESPECIALIZADO") matchesTab = c.category?.toUpperCase() === "ESPECIALIZADO";
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex min-h-screen bg-background font-sans relative">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader
          title="Gestión de Contenido"
          description="Administra los cursos de formación de tu empresa y el contenido global."
          icon={<i className="bi bi-gear-fill"></i>}
          action={
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/administrator/admin/courses"
                className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm w-full"
              >
                <i className="bi bi-eye-fill"></i>Vista de empleado
              </Link>

              <Link
                href="/dashboard/administrator/admin/courses/manage/new"
                className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm w-full"
              >
                <i className="bi bi-plus-lg"></i> Nuevo curso
              </Link>
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
            {/* Filtros y Buscador */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <div className="flex bg-background border border-input p-1 rounded-xl shrink-0">
                {["ALL", "BASICO", "ESPECIALIZADO"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tab === "ALL" ? "Todos" : tab === "BASICO" ? "Onboarding" : "Especialización"}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:max-w-xs">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar curso..."
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-150">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nombre del Curso</th>
                    <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Categoría</th>
                    <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Rol Requerido</th>
                    <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {!loading && filtered.map((course) => (
                    <tr key={course.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 lg:px-8 py-5">
                        <Link href={`/dashboard/administrator/admin/courses/manage/view/${course.id}`} className="flex items-center gap-4 cursor-pointer group/link">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${course.isPublic ? "bg-green-500/10 text-green-600 border-green-500/20 group-hover/link:bg-green-600 group-hover/link:text-white" : "bg-primary/5 text-primary border border-primary/10 group-hover/link:bg-primary group-hover/link:text-white"}`}>
                            <i className={`bi ${course.isPublic ? "bi-globe" : "bi-journal-text"} text-lg`}></i>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover/link:text-primary transition-colors">{course.title}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60 flex items-center gap-1">
                              {course.isPublic ? <span className="text-green-600"><i className="bi bi-globe"></i> Público</span> : <span className="text-primary"><i className="bi bi-building"></i> Privado</span>}
                              <span className="mx-1">•</span> Click para ver contenido
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-center">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${course.category?.toUpperCase() === "ESPECIALIZADO" ? "bg-secondary/10 text-secondary border border-secondary/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                          {course.category?.toUpperCase() === "ESPECIALIZADO" ? "Especialización" : "Onboarding"}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-center">
                        {course.category?.toUpperCase() === "ESPECIALIZADO" && course.jobRole ? (
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            <i className="bi bi-person-badge mr-1 text-[8px]"></i>
                            {course.jobRole}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider bg-muted/50 text-muted-foreground border border-border/50">
                            <i className="bi bi-people mr-1 text-[8px]"></i>
                            Todos los roles
                          </span>
                        )}
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!course.isPublic && (
                            <>
                              <button
                                onClick={() => setCourseToEdit({
                                  ...course,
                                  requiredRole: course.jobRole || "",
                                  imageUrl: course.fileUrl || null
                                })}
                                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 cursor-pointer"
                                title="Editar curso"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                onClick={() => setCourseToDelete(course.id)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all border border-transparent hover:border-destructive/20 cursor-pointer bg-transparent"
                                title="Eliminar curso"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Edición Rápida */}
      {courseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-foreground mb-6 tracking-tight">Editar Curso</h3>

            <form onSubmit={handleUpdate} className="space-y-5">

              {/* Campo de Imagen */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Imagen de portada</label>
                <label className="relative h-32 w-full border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-muted/30 hover:border-primary transition-all cursor-pointer group overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCourseToEdit({
                          ...courseToEdit,
                          newImageFile: file,
                          imageUrl: URL.createObjectURL(file)
                        });
                      }
                    }}
                  />
                  {courseToEdit.imageUrl ? (
                    <img src={courseToEdit.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-camera text-xl text-muted-foreground"></i>
                      <p className="text-[10px] font-bold">Cambiar imagen</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <i className="bi bi-pencil text-white"></i>
                  </div>
                </label>
              </div>

              {/* Título */}
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Título del curso</label>
                <input
                  type="text"
                  value={courseToEdit.title}
                  onChange={(e) => setCourseToEdit({ ...courseToEdit, title: e.target.value })}
                  className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Categoría</label>
                <select
                  value={courseToEdit.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setCourseToEdit({
                      ...courseToEdit,
                      category: newCategory,
                      // Si cambia a BASICO, limpiar requiredRole
                      requiredRole: newCategory === "BASICO" ? "" : courseToEdit.requiredRole
                    });
                  }}
                  className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="BASICO">Onboarding</option>
                  <option value="ESPECIALIZADO">Especialización</option>
                </select>
              </div>

              {/* Rol Requerido - Solo para especialización */}
              {courseToEdit.category === "ESPECIALIZADO" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">
                    Rol Requerido
                  </label>
                  <select
                    value={courseToEdit.requiredRole || ""}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, requiredRole: e.target.value })}
                    className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    disabled={loadingRoles}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Solo los empleados con este rol podrán ver y acceder al curso
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 uppercase text-xs tracking-widest"
                >
                  {updating ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="w-full py-3.5 bg-muted text-foreground rounded-xl font-bold hover:bg-border transition-all uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border border-border">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">¿Eliminar curso?</h3>
            <p className="text-muted-foreground text-sm mb-8">Esta acción borrará permanentemente el curso.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full py-3.5 bg-destructive text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-destructive/20"
              >
                {deleting ? "Borrando..." : "Sí, eliminar curso"}
              </button>
              <button
                onClick={() => setCourseToDelete(null)}
                className="w-full py-3.5 bg-muted text-foreground rounded-xl font-bold hover:bg-border transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}