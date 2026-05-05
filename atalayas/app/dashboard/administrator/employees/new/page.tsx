"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

export default function NewEmployeePage() {
  const router = useRouter();

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estado del formulario unificado (sin password)
  const [form, setForm] = useState({
    name: "",
    email: "",
    jobRole: "",
    role: "EMPLOYEE",
    companyId: "",
  });

  // Función para generar contraseña aleatoria
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Inicialización de usuario
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setForm((prev) => ({ ...prev, companyId: user.companyId || "" }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Generar contraseña aleatoria
      const randomPassword = generateRandomPassword();

      const payload = {
        ...form,
        password: randomPassword,
      };

      const res = await fetch(API_ROUTES.USERS.CREATE || API_ROUTES.USERS.GET_ALL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar el usuario");

      router.push("/dashboard/administrator/employees");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role={currentUser.role} />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader
          title="Nuevo Empleado"
          description="Añade un nuevo miembro a tu organización. Se generará una contraseña temporal automáticamente."
          icon={<i className="bi bi-person-plus-fill"></i>}
          backUrl="/dashboard/administrator/employees"
        />

        <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8 lg:p-10 transition-all">

            {/* Mensaje de Error */}
            {error && (
              <div className="p-4 mb-8 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <i className="bi bi-exclamation-octagon-fill text-sm"></i> {error}
              </div>
            )}

            {/* Mensaje informativo sobre la contraseña */}
            <div className="p-4 mb-8 bg-primary/5 border border-primary/20 rounded-xl text-primary text-xs flex items-center gap-2">
              <i className="bi bi-info-circle-fill text-sm"></i>
              <span>Se generará una contraseña temporal automáticamente y se enviará al correo del usuario.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

              {/* Encabezado de Sección */}
              <div className="flex items-center gap-4 pb-2 border-b border-border/50">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg shrink-0 border border-primary/20">
                  <i className="bi bi-person-vcard"></i>
                </div>
                <h3 className="font-bold text-foreground text-base tracking-tight">
                  Información del empleado
                </h3>
              </div>

              {/* Formulario en Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Nombre */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez García"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nombre@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Puesto */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Puesto de Trabajo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Técnico de Mantenimiento"
                    value={form.jobRole}
                    onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Rol de Acceso */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Rol de Acceso
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer transition-all shadow-sm"
                  >
                    <option value="EMPLOYEE">Empleado Estándar</option>
                    <option value="ADMIN">Administrador de Empresa</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-6 border-t border-border flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm hover:opacity-90 shadow-md shadow-secondary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><i className="bi bi-arrow-repeat animate-spin"></i> Creando...</>
                  ) : (
                    'Crear Empleado'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}