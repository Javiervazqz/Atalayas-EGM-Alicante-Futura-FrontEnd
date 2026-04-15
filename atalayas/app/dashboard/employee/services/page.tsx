"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import SearchInput from "@/components/ui/Searchbar";
import { API_ROUTES } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "COMPANY">("PUBLIC");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) return;

        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setServices(data);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const autoConfirmTask = async () => {
      if (fromTaskId) {
        try {
          const token = localStorage.getItem("token");
          await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId: fromTaskId, done: true }),
          });
          console.log("Tarea de onboarding completada automáticamente");
        } catch (err) {
          console.error("Error al autocompletar:", err);
        }
      }
    };

    autoConfirmTask();
  }, [fromTaskId]);

  const filtered = services.filter((s) => {
    const matchesSearch = s.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filter === "PUBLIC") return matchesSearch && s.isPublic;
    if (filter === "COMPANY") return matchesSearch && !s.isPublic;
    return matchesSearch;
  });

  const sortedServices = [...filtered].sort((a, b) => {
    if (a.isPublic && !b.isPublic) return -1;
    if (!a.isPublic && b.isPublic) return 1;
    return a.title.localeCompare(b.title);
  });

  if (!currentUser) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          
          {/* BANNER COMPACTO UNIFICADO */}
          <header className="bg-white rounded-[2rem] p-8 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
                Servicios disponibles
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Explora y gestiona tus beneficios y herramientas corporativas</p>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar servicios..."
            />
          </header>

          {/* CHIPS DE FILTRADO - ICONOS RESTAURADOS */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["ALL", "PUBLIC", "COMPANY"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`relative shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type
                    ? "text-white"
                    : "bg-white text-[#86868b] border border-gray-200"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {type === "ALL" ? (
                    "Todos"
                  ) : type === "PUBLIC" ? (
                    <><i className="bi bi-globe text-green-400"></i> Públicos</>
                  ) : (
                    <><i className="bi bi-building-fill text-blue-400"></i> Mi empresa</>
                  )}
                </span>
                {filter === type && (
                  <motion.div 
                    layoutId="pill-bg-services"
                    className="absolute inset-0 bg-[#1d1d1f] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {sortedServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Link href={`/dashboard/employee/services/${service.id}`}>
                    <div className="group bg-white rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.98]">
                      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 border-b border-gray-100">
                        {service.mediaUrl && (
                          <img
                            src={service.mediaUrl}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-[#1d1d1f] mb-2 group-hover:text-[#0071e3] transition-colors line-clamp-2 h-14 overflow-hidden">
                          {service.title}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${service.isPublic ? "text-green-600" : "text-gray-400"}`}
                          >
                            {service.isPublic ? (
                              <span className="flex items-center gap-1">
                                <i className="bi bi-globe text-green-400"></i> Público
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <i className="bi bi-building-fill text-blue-400"></i> Mi empresa
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}