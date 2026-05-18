'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface NotificationBellProps {
  unreadCount: number;
  onReset: () => void;
  latestItems: any[];
  lastResetDate: Date | null; // Nueva prop para el control de "leídos"
}

export default function NotificationBell({ 
  unreadCount, 
  onReset, 
  latestItems, 
  lastResetDate 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) onReset();
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center 
                   text-white/90 bg-white/10 dark:bg-white/10 
                   border border-white/20 dark:border-white/20 
                   hover:bg-white/20 transition-all duration-300 backdrop-blur-md shadow-lg"
      >
        <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill' : 'bi-bell'} text-lg`}></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-black border-2 border-slate-900 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-90" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="absolute right-0 top-full mt-4 w-85 
                         bg-white/95 dark:bg-slate-950/95 
                         border border-slate-200 dark:border-white/10 
                         rounded-[2rem] shadow-2xl backdrop-blur-3xl z-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-500 dark:text-white/90 uppercase tracking-[0.3em]">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black uppercase">
                    {unreadCount} Nuevas
                  </span>
                )}
              </div>
              
              {/* Lista de Items */}
              <div className="max-h-100 overflow-y-auto no-scrollbar">
                {latestItems.length > 0 ? (
                  latestItems.map((item) => {
                    // LÓGICA DE APAGADO:
                    // Es leído si la fecha del ítem es anterior al último reset o si no hay pendientes
                    const isRead = lastResetDate 
                      ? new Date(item.date) <= lastResetDate 
                      : unreadCount === 0;

                    return (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href || '#'} 
                        onClick={() => setIsOpen(false)}
                        className={`block relative px-6 py-4 border-b border-slate-50 dark:border-white/5 transition-all group
                          ${isRead ? 'opacity-40 grayscale-[0.3]' : 'bg-blue-50/20 dark:bg-primary/5 opacity-100'}`}
                      >
                        {/* Indicador lateral: Solo brilla si no es leído */}
                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all ${
                          isRead 
                            ? 'bg-slate-300 dark:bg-white/10' 
                            : (item.type === 'EVENTO' ? 'bg-orange-500 shadow-lg' : 'bg-teal-500 shadow-lg')
                        }`} />
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                isRead 
                                  ? 'border-slate-300 text-slate-400' 
                                  : (item.type === 'EVENTO' ? 'border-orange-500/30 text-orange-500' : 'border-teal-500/30 text-teal-500')
                              }`}>
                                {item.type}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {formatTimeAgo(item.date)}
                            </span>
                          </div>
                          
                          <h4 className={`text-[14px] font-bold tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-primary transition-colors ${
                            isRead ? 'text-slate-500' : 'text-slate-800 dark:text-white'
                          }`}>
                            {item.title}
                          </h4>
                          
                          <p className="text-[12px] text-slate-500 dark:text-white/50 line-clamp-2 leading-snug">
                            {item.displayContent || item.content}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-[10px] text-slate-300 dark:text-white/20 uppercase font-bold tracking-[0.2em]">Bandeja vacía</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}