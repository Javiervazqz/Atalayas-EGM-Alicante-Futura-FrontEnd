"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import SearchInput from "@/components/ui/Searchbar";
import { API_ROUTES } from "@/lib/utils";

export default function EmployeeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "COMPANY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Servicios
            </h1>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar servicios..."
            />
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["ALL", "PUBLIC", "COMPANY"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {type === "ALL" ? (
                  "Todos"
                ) : type === "PUBLIC" ? (
                  <span className="flex items-center gap-2">
                    <i className={`bi bi-globe ${filter === type ? "text-primary-foreground" : "text-primary"}`}></i> Públicos
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className={`bi bi-building-fill ${filter === type ? "text-primary-foreground" : "text-secondary"}`}></i> Mi
                    empresa{" "}
                  </span>
                )}{" "}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-card rounded-3xl border border-border animate-pulse"
                />
              ))}
            </div>
          ) : sortedServices.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border">
              <span className="text-4xl text-muted-foreground/50 mb-4 block"><i className="bi bi-search"></i></span>
              <p className="text-muted-foreground font-medium">No se encontraron servicios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/dashboard/employee/services/${service.id}`}
                >
                  <div className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-secondary transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-95">
                    
                    <div className="relative w-full aspect-video overflow-hidden bg-muted border-b border-border flex items-center justify-center">
                      {service.mediaUrl ? (
                        <img
                          src={service.mediaUrl}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <i className="bi bi-image text-4xl text-muted-foreground/30"></i>
                      )}
                    </div>

                    <div className="p-5 lg:p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-secondary transition-colors line-clamp-2 min-h-[3.5rem]">
                        {service.title}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${service.isPublic ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          {service.isPublic ? "🌐 Público" : "🔒 Privado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}