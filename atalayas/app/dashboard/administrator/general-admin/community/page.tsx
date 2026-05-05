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
  description?: string;
}

export default function EcosystemPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');
  
  const [entityToDelete, setEntityToDelete] = useState<Colaborador | null>(null);

  useEffect(() => {
    const fetchEcosystem = async () => {
      try {
        const mockData = [
          // UNIVERSIDADES
           {
            id: 'eco-1',
            name: 'UNIVERSIDAD DE ALICANTE',
            type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
            description: 'Universidad pública con una fuerte vocación de I+D+i y proyectos de transferencia tecnológica.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-ua.png',
            website: 'https://www.ua.es'
          },
          {
            id: 'eco-2',
            name: 'UNIVERSIDAD MIGUEL HERNÁNDEZ DE ELCHE',
            type: 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN',
            description: 'Programas de innovación y colaboración directa con empresas e instituciones.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-umh.png',
            website: 'https://www.umh.es'
          },
          {
            id: 'eco-3',
            name: 'PARQUE CIENTÍFICO DE ALICANTE',
            type: 'PARQUES CIENTÍFICOS',
            description: 'Ecosistema impulsado por la UA que conecta investigación, empresas y talento.',
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
            description: 'Centro tecnológico especializado en productos infantiles y ocio industrial.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-aiju.png',
            website: 'https://www.aiju.es'
          },
          {
            id: 'eco-6',
            name: 'INESCOP INSTITUTO TECNOLÓGICO',
            type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
            description: 'Centro de innovación y tecnología experto en el sector del calzado.',
            logoUrl: 'https://atalayas.com/wp-content/uploads/2026/02/logo-inescop.png',
            website: 'https://www.inescop.es'
          },
          {
            id: 'eco-7',
            name: 'AITEX CENTRO DE INVESTIGACIÓN',
            type: 'INSTITUTOS Y CENTROS TECNOLÓGICOS',
            description: 'Instituto tecnológico de referencia en investigación aplicada al sector textil.',
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

  const handleDelete = () => {
    if (entityToDelete) {
      setColaboradores(colaboradores.filter(c => c.id !== entityToDelete.id));
      setEntityToDelete(null);
    }
  };

  const filteredList = filter === 'TODOS' 
    ? colaboradores 
    : colaboradores.filter(c => c.type === filter);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-y-auto flex flex-col relative no-scrollbar">
        <PageHeader 
          title="Ecosistema de Proximidad"
          description="Gestiona las entidades y colaboradores clave que forman parte del ecosistema EGM."
          icon={<i className="bi bi-globe-americas"></i>}
          action={
            <Link 
              href="/dashboard/administrator/general-admin/community/new"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className="bi bi-plus-lg text-sm"></i> Añadir Entidad
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-400 mx-auto w-full relative z-0">
          
          <div className="flex flex-wrap gap-2 mb-10 bg-card border border-border p-2 rounded-2xl shadow-sm w-fit">
            {['TODOS', 'UNIVERSIDADES Y CENTROS DE INVESTIGACIÓN', 'PARQUES CIENTÍFICOS', 'INSTITUTOS Y CENTROS TECNOLÓGICOS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {cat === 'TODOS' ? 'Todos' : cat}
              </button>
            ))}
          </div>

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
                  
                  <div className="aspect-square bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-sm group-hover:shadow-2xl group-hover:border-primary/40 transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden relative">
                    
                    <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-90 group-hover:blur-sm">
                      <img 
                        src={entidad.logoUrl} 
                        alt={entidad.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="absolute inset-0 bg-background/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6 z-10">
                      <div className="flex gap-3">
                        <Link 
                          href={`/dashboard/administrator/general-admin/community/manage/${entidad.id}`}
                          className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          title="Editar"
                        >
                          <i className="bi bi-pencil-fill text-lg"></i>
                        </Link>
                        <button 
                          onClick={() => setEntityToDelete(entidad)}
                          className="w-12 h-12 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          title="Eliminar"
                        >
                          <i className="bi bi-trash3-fill text-lg"></i>
                        </button>
                      </div>
                      <a 
                        href={entidad.website} target="_blank" rel="noopener noreferrer"
                        className="mt-2 text-secondary text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20"
                      >
                        Visitar Web <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                    </div>
                  </div>
                  
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

      {entityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
              <i className="bi bi-exclamation-triangle-fill text-4xl"></i>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground mb-2">¿Eliminar entidad?</h3>
            <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
              Estás a punto de eliminar <strong>{entityToDelete.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex w-full gap-4">
              <button onClick={() => setEntityToDelete(null)} className="flex-1 py-4 rounded-2xl bg-muted text-muted-foreground font-bold text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-destructive/30">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}