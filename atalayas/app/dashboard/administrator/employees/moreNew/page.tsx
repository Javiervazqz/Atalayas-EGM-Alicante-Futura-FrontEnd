"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";
import Papa from "papaparse";

export default function BulkCreatePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data.map((row: any) => {
                    const rawRole = (row.rol || row.role || "").trim().toUpperCase();
                    const finalRole = rawRole.includes("ADMIN") ? "ADMIN" : "EMPLOYEE";

                    return {
                        name: row.nombre || row.name || "",
                        email: row.email || row.correo || "",
                        password: row.password || row.contraseña || "123456",
                        role: finalRole,
                        jobRole: row.puesto || row.trabajo || row.jobRole || "",
                        status: "pendiente", // Solo para uso en el Frontend
                        errorMsg: "",        // Solo para uso en el Frontend
                    };
                });
                setEmployees(parsedData);
                setError("");
            },
            error: (err) => setError("Error al leer el archivo CSV: " + err.message),
        });
    };

    const updateEmployee = (index: number, field: string, value: string) => {
        const updated = [...employees];
        updated[index] = { ...updated[index], [field]: value };
        setEmployees(updated);
    };

    const removeEmployee = (index: number) => {
        setEmployees(employees.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (employees.length === 0) return;
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const updatedEmployees = [...employees];
        let hasCriticalError = false;
        let errorCount = 0;

        for (let i = 0; i < updatedEmployees.length; i++) {
            const emp = updatedEmployees[i];
            if (emp.status === "completado") continue;

            try {
                // LIMPIEZA DE DATOS: Solo enviamos lo que el Backend acepta
                const payload = {
                    name: emp.name,
                    email: emp.email,
                    password: emp.password,
                    role: emp.role,
                    jobRole: emp.jobRole,
                    companyId: currentUser.companyId,
                };

                const res = await fetch(API_ROUTES.USERS.CREATE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    updatedEmployees[i].status = "completado";
                    updatedEmployees[i].errorMsg = "";
                } else {
                    hasCriticalError = true;
                    errorCount++;
                    updatedEmployees[i].status = "error";
                    updatedEmployees[i].errorMsg = res.status === 409
                        ? "Email duplicado"
                        : (data.message || "Error de validación");
                }
            } catch (err) {
                hasCriticalError = true;
                errorCount++;
                updatedEmployees[i].status = "error";
                updatedEmployees[i].errorMsg = "Error de conexión";
            }
            // Actualizamos el estado fila por fila para dar feedback visual
            setEmployees([...updatedEmployees]);
        }

        if (!hasCriticalError) {
            setTimeout(() => router.push("/dashboard/administrator/employees"), 1500);
        } else {
            setError(`Se detectaron errores en ${errorCount} registro(s).`);
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex min-h-screen bg-background font-sans text-foreground">
            <Sidebar role={currentUser.role} />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title="Carga Masiva"
                    description="Sube archivos CSV para registrar múltiples empleados simultáneamente."
                    icon={<i className="bi bi-file-earmark-spreadsheet-fill"></i>}
                    backUrl="/dashboard/administrator/employees"
                />

                <div className="p-6 lg:p-10 w-full max-w-[1400px] mx-auto transition-all animate-in fade-in duration-500">

                    {/* ZONA DE CARGA INICIAL */}
                    {employees.length === 0 ? (
                        <div className="bg-card rounded-[2rem] border-2 border-dashed border-border p-16 text-center flex flex-col items-center justify-center shadow-sm">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
                                <i className="bi bi-cloud-arrow-up-fill text-4xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Sube tu archivo .csv</h2>
                            <p className="text-muted-foreground max-w-sm mb-10 text-sm font-medium">
                                El archivo debe contener las columnas: <span className="text-foreground font-bold">nombre, email, contraseña, rol y puesto.</span>
                            </p>

                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                            <label
                                htmlFor="csv-upload"
                                className="bg-secondary text-secondary-foreground px-12 py-4 rounded-2xl font-bold cursor-pointer hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center gap-3"
                            >
                                <i className="bi bi-folder2-open"></i> Seleccionar archivo
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* TABLA DE PREVISUALIZACIÓN */}
                            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        Contraseña
                                                        <button
                                                            onClick={() => setShowPasswords(!showPasswords)}
                                                            className="bg-primary/10 text-primary w-6 h-6 rounded-md hover:bg-primary hover:text-white transition-colors border-none"
                                                        >
                                                            <i className={`bi ${showPasswords ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Puesto</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Rol</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                                <th className="px-6 py-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {employees.map((emp, i) => (
                                                <tr key={i} className={`transition-colors ${emp.status === 'error' ? 'bg-destructive/5' : 'hover:bg-muted/30'}`}>
                                                    <td className="px-4 py-2">
                                                        <input className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:text-primary" value={emp.name} onChange={(e) => updateEmployee(i, 'name', e.target.value)} />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:text-primary" value={emp.email} onChange={(e) => updateEmployee(i, 'email', e.target.value)} />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type={showPasswords ? "text" : "password"}
                                                            className="w-full bg-transparent p-2 text-sm font-bold outline-none text-center tracking-widest"
                                                            value={emp.password}
                                                            onChange={(e) => updateEmployee(i, 'password', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:text-primary" value={emp.jobRole} onChange={(e) => updateEmployee(i, 'jobRole', e.target.value)} />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <select
                                                            className="bg-muted px-3 py-1.5 rounded-xl text-[10px] font-black border-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                                                            value={emp.role}
                                                            onChange={(e) => updateEmployee(i, 'role', e.target.value)}
                                                        >
                                                            <option value="EMPLOYEE">EMPLEADO</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-2">
                                                        {emp.status === "completado" ? (
                                                            <span className="inline-flex items-center gap-1.5 text-green-600 text-[10px] font-black tracking-tighter">
                                                                <i className="bi bi-check-circle-fill text-sm"></i> LISTO
                                                            </span>
                                                        ) : emp.status === "error" ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-destructive text-[9px] font-black uppercase italic">Error</span>
                                                                <span className="text-destructive/80 text-[10px] font-medium leading-none truncate max-w-[120px]">{emp.errorMsg}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/40 text-[10px] font-black uppercase italic tracking-tighter">Pendiente</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-2 text-right">
                                                        <button onClick={() => removeEmployee(i)} className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border-none bg-transparent cursor-pointer">
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ALERTAS Y ACCIONES */}
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <i className="bi bi-exclamation-triangle-fill text-lg"></i> {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-[2rem] border border-border">
                                <button
                                    onClick={() => setEmployees([])}
                                    className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    <i className="bi bi-x-lg mr-2"></i> Cancelar y limpiar
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || employees.every(e => e.status === 'completado')}
                                    className="w-full sm:w-auto bg-secondary text-secondary-foreground px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-secondary/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer"
                                >
                                    {loading ? (
                                        <><i className="bi bi-arrow-repeat animate-spin text-lg"></i> Procesando...</>
                                    ) : (
                                        <><i className="bi bi-cloud-check-fill text-lg"></i> Procesar {employees.filter(e => e.status !== 'completado').length} registros</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}