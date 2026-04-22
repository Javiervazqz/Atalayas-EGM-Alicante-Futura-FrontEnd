"use client";

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/lib/utils";
import Sidebar from "@/components/ui/Sidebar";
import SearchBar from "@/components/ui/Searchbar";

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

interface Suggestion {
  id: string;
  title: string;
  content: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
  targetRole: "ADMIN" | "GENERAL_ADMIN";
  response?: string;
  respondedAt?: string;
  createdAt: string;
  User?: { 
    name: string;
    email: string;
  };
  Company?: { 
    name: string;
  };
}

const statusConfig = {
  PENDING: { label: "Pendientes", color: "#ff9500", bg: "rgba(255,149,0,0.1)", icon: "bi-clock" },
  ACCEPTED: { label: "Aceptadas", color: "#34c759", bg: "rgba(52,199,89,0.1)", icon: "bi-check2-circle" },
  REJECTED: { label: "Rechazadas", color: "#ff3b30", bg: "rgba(255,59,48,0.1)", icon: "bi-x-circle" },
  ARCHIVED: { label: "Archivadas", color: "#86868b", bg: "rgba(134,134,139,0.1)", icon: "bi-archive" },
};

export default function GeneralAdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [responseBody, setResponseBody] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<keyof typeof statusConfig | "ALL">("PENDING"); 
  const [searchQuery, setSearchQuery] = useState("");

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ROUTES.SUGGESTIONS.GET_ALL}?target=GENERAL_ADMIN`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setSuggestions(list);

      // Sincronizar el contador inicial en el storage al cargar la página
      const pendingCount = list.filter((s: any) => s.status === "PENDING").length;
      localStorage.setItem("count_suggestions", pendingCount.toString());
      window.dispatchEvent(new CustomEvent("local-storage-update", { detail: { suggestions: pendingCount } }));
      
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSuggestions(); 
  }, []);

  const handleRespond = async (status: "ACCEPTED" | "REJECTED") => {
    if (!selected) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.RESPOND(selected.id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            response: responseBody.trim() || "La administración no ha proporcionado comentarios adicionales.", 
            status 
        }),
      });

      if (!res.ok) throw new Error("Error al responder");
      
      // --- LÓGICA DE ACTUALIZACIÓN DINÁMICA ---
      const current = Number(localStorage.getItem("count_suggestions")) || 0;
      const newValue = Math.max(0, current - 1);
      
      // Actualizamos storage
      localStorage.setItem("count_suggestions", newValue.toString());
      
      // Avisamos al Sidebar por evento (esto cambia el icono y badge al instante)
      window.dispatchEvent(new CustomEvent("local-storage-update", { 
        detail: { suggestions: newValue } 
      }));

      // Refrescar lista local y limpiar UI
      await fetchSuggestions();
      setSelected(null);
      setResponseBody("");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar la respuesta.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = suggestions
    .filter((s) => (filter === "ALL" ? true : s.status === filter))
    .filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.User?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f7", fontFamily: appleFont }}>
      <Sidebar role="GENERAL_ADMIN" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "24px 32px" }}>
          <div>
            <h1 style={{ color: "#1d1d1f", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              Buzón General
            </h1>
            <p style={{ color: "#86868b", fontSize: "14px", margin: 0 }}>
              Sugerencias dirigidas a la administración global de la plataforma
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", border: "none",
                    background: filter === f ? "#1d1d1f" : "#f5f5f7",
                    color: filter === f ? "#fff" : "#424245",
                    fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {f === "ALL" ? "Todas" : statusConfig[f].label}
                </button>
              ))}
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por título, usuario o empresa..." />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "24px 32px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: "100px", background: "#fff", borderRadius: "20px", opacity: 0.5 }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <p style={{ color: "#86868b" }}>No hay sugerencias {filter !== 'ALL' ? 'pendientes' : ''}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    style={{
                      background: "#fff", borderRadius: "20px", padding: "20px", cursor: "pointer",
                      border: selected?.id === s.id ? "2px solid #0071e3" : "2px solid transparent",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#0071e3", textTransform: "uppercase" }}>
                        {s.Company?.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "#86868b" }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1d1d1f", margin: "0 0 4px" }}>{s.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: statusConfig[s.status].bg, color: statusConfig[s.status].color, padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>
                        {statusConfig[s.status].label.slice(0, -1)}
                      </span>
                      <span style={{ fontSize: "12px", color: "#86868b" }}>
                        Por {s.User?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div style={{ overflowY: "auto", borderLeft: "1px solid rgba(0,0,0,0.06)", background: "#fff", padding: "32px" }}>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#0071e3", fontSize: "14px", cursor: "pointer", marginBottom: "24px" }}>
                <i className="bi bi-chevron-left"></i> Cerrar detalle
              </button>

              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1d1d1f" }}>{selected.title}</h2>
                <p style={{ fontSize: "13px", color: "#1d1d1f", marginTop: "8px", marginBottom: "2px" }}>
                  <b>{selected.User?.name}</b>
                </p>
                <p style={{ fontSize: "12px", color: "#86868b", margin: 0 }}>
                    {selected.User?.email} • {selected.Company?.name}
                </p>
                
                <div style={{ background: "#f5f5f7", borderRadius: "16px", padding: "20px", marginTop: "20px", lineHeight: 1.5 }}>
                  {selected.content}
                </div>
              </div>

              {selected.status === "PENDING" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Responder a la propuesta</h3>
                  <textarea
                    value={responseBody}
                    onChange={(e) => setResponseBody(e.target.value)}
                    placeholder="(Opcional) Escribe aquí los motivos de la decisión..."
                    rows={6}
                    style={{
                      width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid #d2d2d7",
                      fontSize: "14px", outline: "none", resize: "none"
                    }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond("ACCEPTED")}
                      style={{ padding: "14px", borderRadius: "12px", border: "none", background: "#34c759", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Aceptar
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond("REJECTED")}
                      style={{ padding: "14px", borderRadius: "12px", border: "none", background: "#ff3b30", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "16px", padding: "20px", border: "1px solid #d2d2d7" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: statusConfig[selected.status].color, textTransform: "uppercase" }}>
                    Estado: {statusConfig[selected.status].label.slice(0, -1)}
                  </p>
                  <p style={{ fontSize: "14px", marginTop: "8px", color: "#424245", fontStyle: "italic" }}>
                    "{selected.response || "Sin comentarios adicionales."}"
                  </p>
                  <p style={{ fontSize: "11px", color: "#86868b", marginTop: "16px" }}>
                    Gestionada el {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}