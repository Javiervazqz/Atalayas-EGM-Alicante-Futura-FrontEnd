'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import Link from 'next/link';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

// ── Interfaces de Datos (Basadas en tu Prisma) ───────────────────────────
interface Overview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalDocuments: number;
  avgProgress: number;
  completionRate: number;
}

interface TopCourse { 
  id: string; 
  title: string; 
  _count: { Enrollment: number } 
}

interface TrendEntry { 
  createdAt: string 
}

interface RoleDist {
  jobRole: string;
  _count: number;
}

interface StatsData {
  overview: Overview;
  top: { courses: TopCourse[] };
  trends: { usersByMonth: TrendEntry[] };
  // Nuevas métricas extraídas de Onboarding, Sugerencias y Roles
  onboarding: { finished: number; total: number };
  suggestions: { pending: number };
  roles: RoleDist[];
}

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── Lógica de Agrupación Temporal ─────────────────────────────────────────
function groupByMonth(entries: TrendEntry[] = []): { label: string; count: number }[] {
  const now = new Date();
  const result: { label: string; count: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTHS_ES[d.getMonth()];
    
    const count = entries.filter((e) => {
      const ed = new Date(e.createdAt);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    }).length;
    
    result.push({ label, count });
  }
  return result;
}

// ── Componente de Gráfica de Barras ────────────────────────────────────────
function HubBarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 0);
  const scaleMax = max === 0 ? 1 : max;

  return (
    <div className="flex items-end justify-between h-44 gap-3 pt-8 px-2">
      {data.map((d, i) => {
        const heightPercentage = (d.count / scaleMax) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
            <div className="w-full relative flex flex-col justify-end items-center h-full">
              <span className="absolute -top-7 text-[11px] font-black text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {d.count}
              </span>
              <div 
                className="w-full rounded-t-xl transition-all duration-700 ease-out bg-secondary/80 group-hover:bg-secondary shadow-sm"
                style={{ 
                  height: d.count > 0 ? `${heightPercentage}%` : '6px',
                  opacity: 0.5 + (i * 0.1)
                }}
              />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    
    setLoading(true);
    fetchWithApiFallback(API_ROUTES.STATS.GET_ADMIN, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((data) => setStats(data))
    .catch((err) => console.error("Error cargando estadísticas:", err))
    .finally(() => setLoading(false));
  }, []);

  const usersByMonth = useMemo(() => 
    groupByMonth(stats?.trends?.usersByMonth || []), 
    [stats]
  );

  // KPIs dinámicos con protecciones contra undefined/null
  const kpiList = useMemo(() => {
    // Si stats es null o undefined, devolvemos array vacío
    if (!stats) return [];

    // Extraemos con valores por defecto por seguridad
    const ov = stats.overview;
    const onboarding = stats.onboarding || { finished: 0, total: 0 };
    const suggestions = stats.suggestions || { pending: 0 };

    return [
      { 
        label: 'Plantilla Total', 
        value: ov?.totalUsers ?? 0, 
        icon: <i className="bi bi-people text-secondary"></i> 
      },
      { 
        label: 'Onboarding Realizado', 
        value: `${onboarding.finished ?? 0}/${onboarding.total ?? 0}`, 
        icon: <i className="bi bi-person-check text-primary"></i> 
      },
      { 
        label: 'Sugerencias Hoy', 
        value: suggestions.pending ?? 0, 
        icon: <i className="bi bi-chat-left-dots text-secondary"></i> 
      },
      { 
        label: 'Recursos Compartidos', 
        value: ov?.totalDocuments ?? 0, 
        icon: <i className="bi bi-folder2-open text-primary"></i> 
      },
    ];
  }, [stats]);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Estadísticas Corporativas"
          description="Monitorea el progreso de onboarding, formación y feedback de tu equipo."
          icon={<i className="bi bi-bar-chart-line-fill"></i>}
        />

        <div className="p-6 lg:p-10 flex-1 space-y-8">
          
          {/* SECCIÓN 1: KPIs PRINCIPALES */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-card border border-border rounded-3xl animate-pulse" />
              ))
            ) : (
              kpiList.map((kpi) => (
                <div key={kpi.label} className="bg-card rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.label}</div>
                    <div className="text-lg bg-muted/50 border border-border w-9 h-9 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                      {kpi.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-black tracking-tight">{kpi.value}</div>
                </div>
              ))
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* SECCIÓN 2: GRÁFICO DE REGISTROS MENSUALES */}
            <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Crecimiento de Equipo</h2>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Nuevos usuarios en los últimos 6 meses</p>
                </div>
              </div>

              {loading ? (
                <div className="h-44 bg-muted/30 rounded-2xl animate-pulse mt-8" />
              ) : (
                <HubBarChart data={usersByMonth} />
              )}
            </div>

            {/* SECCIÓN 3: DISTRIBUCIÓN POR ROLES (Basado en jobRole) */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-black tracking-tight mb-8 text-center">Empleados por Rol</h2>
              <div className="space-y-5">
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-muted rounded-full animate-pulse" />)
                ) : (
                  stats?.roles.map((r, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                        <span>{r.jobRole || 'Sin asignar'}</span>
                        <span className="text-secondary">{r._count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary" 
                          style={{ width: `${(r._count / (stats?.overview.totalUsers || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: RENDIMIENTO DE FORMACIÓN Y ACCIÓN */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-black mb-8 text-center uppercase text-[12px] text-muted-foreground tracking-widest">Rendimiento Académico Global</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-5xl font-black text-secondary">{stats?.overview.completionRate || 0}%</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase mt-2">Cursos Completados</div>
                </div>
                <div className="text-center border-l border-border">
                  <div className="text-5xl font-black text-primary">{stats?.overview.avgProgress || 0}%</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase mt-2">Progreso Medio</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}