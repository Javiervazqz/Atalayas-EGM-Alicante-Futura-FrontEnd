'use client';

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/lib/utils";
import Sidebar from "@/components/ui/Sidebar";

// --- TIPOS ---
type SuggestionStatus = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  status: Exclude<SuggestionStatus, 'ALL'>;
  targetRole: "ADMIN" | "GENERAL_ADMIN";
  response?: string;
  createdAt: string;
}

const statusTranslations: Record<Exclude<SuggestionStatus, 'ALL'>, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendiente", color: "#86868b", bg: "#f5f5f7" },
  ACCEPTED: { label: "Aceptada", color: "#27ae60", bg: "#eafaf1" },
  REJECTED: { label: "Rechazada", color: "#e74c3c", bg: "#fff1f0" },
};

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function EmployeeSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Estado para el filtro
  const [filter, setFilter] = useState<SuggestionStatus>('PENDING');

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<"ADMIN" | "GENERAL_ADMIN">("ADMIN");

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchMySuggestions = async () => {
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.GET_MINE, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando sugerencias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    }
    fetchMySuggestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return alert("No se pudo identificar al usuario");

    setIsSubmitting(true);
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title,
          content,
          targetRole,
          authorId: user.id,
          authorRole: "EMPLOYEE",
        }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        fetchMySuggestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta sugerencia?")) return;
    try {
      const res = await fetch(`${API_ROUTES.SUGGESTIONS.DELETE(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setSuggestions(suggestions.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // Lógica de filtrado
  const filteredSuggestions = suggestions.filter(s => 
    filter === 'ALL' ? true : s.status === filter
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f7", fontFamily: appleFont, overflow: "hidden" }}>
      <Sidebar role="EMPLOYEE" />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "450px 1fr", height: "100vh" }}>
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div style={{ background: "#fff", borderRight: "1px solid rgba(0,0,0,0.06)", padding: "40px", display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Tu voz cuenta</h1>
          <p style={{ color: "#86868b", fontSize: "15px", marginBottom: "32px" }}>Envía tus sugerencias de forma directa.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#86868b", textTransform: "uppercase", marginBottom: "10px", display: "block" }}>
                ¿A quién va dirigida?
              </label>
              <div style={{ display: "flex", background: "#f5f5f7", padding: "4px", borderRadius: "12px" }}>
                <button type="button" onClick={() => setTargetRole("ADMIN")} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: targetRole === "ADMIN" ? "#fff" : "transparent", boxShadow: targetRole === "ADMIN" ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "0.2s" }}>
                  Mi empresa
                </button>
                <button type="button" onClick={() => setTargetRole("GENERAL_ADMIN")} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: targetRole === "GENERAL_ADMIN" ? "#fff" : "transparent", boxShadow: targetRole === "GENERAL_ADMIN" ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "0.2s" }}>
                  Atalayas EGM
                </button>
              </div>
            </div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la sugerencia" style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #d2d2d7", outline: "none", fontSize: "15px" }} required />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detalla aquí tu sugerencia..." rows={8} style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #d2d2d7", outline: "none", fontSize: "15px", resize: "none", lineHeight: "1.5" }} required />

            <button disabled={isSubmitting} type="submit" style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "#0071e3", color: "#fff", fontSize: "16px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {isSubmitting ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTADO */}
        <div style={{ padding: "40px 60px", overflowY: "auto", height: "100%" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#1d1d1f" }}>Historial de sugerencias</h2>

          {/* CHIPS DE FILTRADO */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'PENDING', label: 'Pendientes' },
              { id: 'ACCEPTED', label: 'Aceptadas' },
              { id: 'REJECTED', label: 'Rechazadas' }
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id as SuggestionStatus)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                  background: filter === chip.id ? "#1d1d1f" : "#fff",
                  color: filter === chip.id ? "#fff" : "#86868b",
                  boxShadow: filter === chip.id ? "0 4px 12px rgba(0,0,0,0.12)" : "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "#86868b" }}>Cargando historial...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
              {filteredSuggestions.length === 0 ? (
                <p style={{ color: "#86868b" }}>No hay sugerencias que coincidan con este filtro.</p>
              ) : (
                filteredSuggestions.map((s) => {
                  const statusInfo = statusTranslations[s.status] || statusTranslations.PENDING;
                  return (
                    <div key={s.id} style={{ background: "#fff", padding: "28px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", position: "relative" }}>
                      
                      {/* CABECERA */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span style={{ alignSelf: "flex-start", fontSize: "10px", fontWeight: 800, padding: "5px 12px", borderRadius: "8px", background: statusInfo.bg, color: statusInfo.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {statusInfo.label}
                          </span>
                          <span style={{ fontSize: "12px", color: "#86868b", fontWeight: 500 }}>
                            Para: <span style={{ color: "#1d1d1f" }}>{s.targetRole === "ADMIN" ? "Mi empresa" : "Atalayas EGM"}</span>
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <span style={{ fontSize: "13px", color: "#86868b" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                          
                          {s.status === "PENDING" && (
                            <button 
                              onClick={() => handleDelete(s.id)} 
                              style={{ 
                                background: "rgba(255, 59, 48, 0.08)", 
                                border: "none", 
                                color: "#ff3b30", 
                                cursor: "pointer", 
                                fontSize: "12px", 
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s"
                              }} 
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 59, 48, 0.15)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 59, 48, 0.08)")}
                            >
                              <i className="bi bi-trash3" style={{ fontSize: "14px" }}></i>
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 10px", color: "#1d1d1f" }}>{s.title}</h3>
                      <p style={{ fontSize: "15px", color: "#424245", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>{s.content}</p>

                      {s.response && (
                        <div style={{ marginTop: "24px", padding: "16px", background: "#f5f5f7", borderRadius: "16px", borderLeft: `4px solid ${statusInfo.color}` }}>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: statusInfo.color, textTransform: "uppercase", marginBottom: "4px" }}>Respuesta de administración:</p>
                          <p style={{ fontSize: "14px", color: "#1d1d1f", margin: 0 }}>{s.response}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}