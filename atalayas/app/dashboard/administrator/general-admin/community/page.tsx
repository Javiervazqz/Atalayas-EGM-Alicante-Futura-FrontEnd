'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import Link from 'next/link';

interface Colaborador {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  type: string;
}

export default function EcosystemPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    const fetchEcosystem = async () => {
      try {
        // Sustituir por tu llamada real a la API
        const mockData = [
          {
            id: 'eco-1',
            name: 'UNIVERSIDAD DE ALICANTE',
            type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
            description: 'Universidad pública con una fuerte vocación de I+D+i.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-ua.png',
            website: 'https://www.ua.es'
          },
          {
            id: 'eco-2',
            name: 'UNIVERSIDAD MIGUEL HERNÁNDEZ DE ELCHE',
            type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
            description: 'Universidad pública con múltiples programas de innovación.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-umh.png',
            website: 'https://www.umh.es'
          },
          {
            id: 'eco-3',
            name: 'PARQUE CIENTÍFICO DE ALICANTE',
            type: 'PARQUES CIENTÍFICOS',
            description: 'Ecosistema impulsado por la UA que conecta investigación y empresas.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-pca.png',
            website: 'https://parquecientificoalicante.es'
          },
          {
            id: 'eco-4',
            name: 'PARQUE CIENTÍFICO DE LA UMH',
            type: 'PARQUES CIENTÍFICOS',
            description: 'Plataforma enfocada en la creación y consolidación de empresas innovadoras.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-umhparc.png',
            website: 'https://parquecientificoumh.es'
          },
          {
            id: 'eco-5',
            name: 'AIJU INSTITUTO TECNOLÓGICO',
            type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
            description: 'Centro tecnológico especializado en I+D+i para productos infantiles.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-aiju.png',
            website: 'https://www.aiju.es'
          },
          {
            id: 'eco-6',
            name: 'INESCOP INSTITUTO TECNOLÓGICO',
            type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
            description: 'Centro de innovación experto en el sector del calzado.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-inescop.png',
            website: 'https://www.inescop.es'
          },
          {
            id: 'eco-7',
            name: 'AITEX CENTRO DE INVESTIGACIÓN',
            type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
            description: 'Instituto tecnológico de referencia en sector textil y materiales.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-aitex.png',
            website: 'https://www.aitex.es'
          }
        ];
        setColaboradores(mockData);
      } catch (err) {
        console.error("Error cargando ecosistema:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEcosystem();
  }, []);

  const filteredList = filter === 'TODOS' 
    ? colaboradores 
    : colaboradores.filter(c => c.type === filter);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        {/* BANNER UNIFICADO */}
        <PageHeader 
          title="Ecosistema de Proximidad"
          description="Gestiona las entidades y colaboradores clave que forman parte del ecosistema EGM."
          icon={<i className="bi bi-globe-americas"></i>}
          action={
            <Link 
              href="/dashboard/administrator/general-admin/community/new"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <i className="bi bi-plus-lg text-sm"></i> Añadir Entidad
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-[1600px] mx-auto w-full">
          
          {/* FILTROS TIPO "PÍLDORAS" */}
          <div className="flex flex-wrap gap-2 mb-10 bg-card border border-border p-2 rounded-2xl shadow-sm w-fit">
            {['TODOS', 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN', 'PARQUES CIENTÍFICOS', 'INSTITUTOS Y CENTROS TECNOLÓGICOS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                  filter === cat 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {cat === 'TODOS' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          {/* CUADRÍCULA DE COLABORADORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-12">
            
            {loading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="aspect-square bg-card rounded-[2rem] border border-border animate-pulse shadow-sm" />
               ))
            ) : filteredList.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-card rounded-[2.5rem] border-2 border-dashed border-border shadow-sm">
                <i className="bi bi-search text-5xl text-muted-foreground/30 mb-4 block"></i>
                <p className="text-muted-foreground font-bold text-lg">No hay entidades en esta categoría.</p>
              </div>
            ) : (
              filteredList.map((entidad) => (
                <div key={entidad.id} className="group relative flex flex-col">
                  {/* CARD DE IMAGEN Y ACCIONES */}
                  <div className="aspect-square bg-card rounded-[2rem] border border-border shadow-sm group-hover:shadow-xl group-hover:border-secondary/40 transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden relative active:scale-[0.98]">
                    
                    {/* LOGO */}
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-95 group-hover:blur-sm">
                      {entidad.logoUrl ? (
                        <img 
                          src={entidad.logoUrl} 
                          alt={entidad.name} 
                          className="max-w-full max-h-full object-contain drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-3xl font-black text-muted-foreground uppercase shadow-inner">
                          {entidad.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* OVERLAY DE ACCIONES (Estilo Glassmorphism) */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6">
                      <div className="flex gap-3">
                        <Link 
                          href={`/dashboard/administrator/general-admin/community/edit/${entidad.id}`}
                          className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg hover:-translate-y-1"
                          title="Editar"
                        >
                          <i className="bi bi-pencil-fill text-lg"></i>
                        </Link>
                        <button 
                          className="w-12 h-12 bg-destructive text-destructive-foreground rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg hover:-translate-y-1"
                          onClick={() => {/* Lógica borrar */}}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash3-fill text-lg"></i>
                        </button>
                      </div>
                      <a 
                        href={entidad.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-secondary text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full"
                      >
                        Visitar Web <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                    </div>
                  </div>
                  
                  {/* TEXTO DEBAJO DE LA TARJETA */}
                  <div className="mt-5 text-center px-2">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {entidad.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}