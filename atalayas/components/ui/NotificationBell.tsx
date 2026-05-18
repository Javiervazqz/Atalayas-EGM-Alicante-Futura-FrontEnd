'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface NotificationBellProps {
  unreadCount: number;
  onReset: () => void;
  latestItems: any[];
}

export default function NotificationBell({ unreadCount, onReset, latestItems }: NotificationBellProps) {
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
                   text-white/90 
                   bg-white/10 dark:bg-white/10 
                   border border-white/20 dark:border-white/20 
                   hover:bg-white/20 dark:hover:bg-white/20 
                   transition-all duration-300 backdrop-blur-md shadow-lg"
      >
        <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill' : 'bi-bell'} text-lg`}></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-black border-2 border-slate-900 dark:border-[#1a1c1e] shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            
            {/* Panel de Notificaciones - Adaptativo */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="absolute right-0 top-full mt-4 w-85 
                         bg-white/90 dark:bg-slate-950/90 
                         border border-slate-200 dark:border-white/10 
                         rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] 
                         backdrop-blur-3xl backdrop-saturate-150 z-[100] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-linear-to-b from-slate-50 dark:from-white/5 to-transparent flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-500 dark:text-white/90 uppercase tracking-[0.3em]">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                    {unreadCount} Nuevas
                  </span>
                )}
              </div>
              
              {/* Lista de Items */}
              <div className="max-h-100 overflow-y-auto no-scrollbar">
                {latestItems.length > 0 ? (
                  latestItems.map((item) => (
                    <Link
                    key={`${item.type}-${item.id}`}
                      href={item.href || '#'} 
                      onClick={() => setIsOpen(false)}
                      className="block py-1 border-b border-grey hover:bg-white/5 transition-colors group"
                    >
                    <div 
                      key={`${item.type}-${item.id}`} 
                      className="group relative px-6 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer border-b border-slate-50 dark:border-white/[0.05] last:border-0"
                    >
                      {/* Indicador lateral */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
                        item.type === 'EVENTO' 
                        ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                        : 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                      }`} />
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                              item.type === 'EVENTO' 
                              ? 'border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400' 
                              : 'border-teal-500/20 dark:border-teal-500/30 text-teal-600 dark:text-teal-400'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                              {item.badge === "Evento" ? (item.Company?.name || "Corporativo") : item.badge}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-white/30 font-medium">
                            {formatTimeAgo(item.date)}
                          </span>
                        </div>
                        
                        <h4 className="text-[14px] text-slate-800 dark:text-white font-bold tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        
                        <p className="text-[12px] text-slate-500 dark:text-white/50 line-clamp-2 leading-snug font-normal">
                          {item.displayContent || item.content}
                        </p>
                      </div>
                    </div>
                    </Link>
                  ))
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