'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Estados de datos
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados de Formulario de Edición
  const [editForm, setEditForm] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      if (typeof params.id !== 'string') return;
      const token = localStorage.getItem('token');
      const url = API_ROUTES.ANNOUNCEMENTS.GET_BY_ID(params.id);

      const data = await fetchWithApiFallback(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data || data.error) throw new Error("No encontrado");
      
      setAnnouncement(data);
      // Inicializar el form de edición con los datos actuales
      setEditForm({
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
      });
    } catch (err) {
      console.error("Error cargando anuncio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("content", editForm.content);
      formData.append("isPublic", String(editForm.isPublic));
      
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch(API_ROUTES.ANNOUNCEMENTS.UPDATE(params.id as string), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedFile(null);
        fetchDetail(); // Recargamos los datos
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error al actualizar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ROUTES.ANNOUNCEMENTS.DELETE(params.id as string), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) router.push("/dashboard/administrator/admin/announcements");
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!announcement) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] font-sans text-foreground overflow-hidden">

      <main className="flex-1 overflow-auto flex flex-col no-scrollbar">
        
        <PageHeader 
          title={announcement.title}
          description={`Publicado el ${new Date(announcement.createdAt).toLocaleDateString('es-ES', { 
            day: '2-digit', month: 'long', year: 'numeric' 
          })}`}
          icon={<i className="bi bi-megaphone-fill"></i>}
          backUrl="/dashboard/administrator/admin/announcements"
          action={
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              <i className="bi bi-pencil-fill mr-2"></i> Editar Anuncio
            </button>
          }
        />

        <div className="p-6 lg:p-10 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* CUERPO DEL ANUNCIO */}
              <div className="lg:col-span-8 space-y-6">
                <motion.section 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border shadow-sm ${
                      announcement.isPublic 
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                      : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    }`}>
                      {announcement.isPublic ? '🌐 Comunicado Global' : `${announcement.Company?.name || 'Privado'}`}
                    </span>
                  </div>

                  {announcement.imageUrl && (
                    <div className="mb-10 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="w-full h-auto object-cover max-h-[500px] hover:scale-[1.01] transition-transform duration-700"
                      />
                    </div>
                  )}
                  
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                      {announcement.content || 'Este comunicado no dispone de contenido adicional.'}
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* SIDEBAR INFO */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="sticky top-6 space-y-6">
                  <div className="bg-white dark:bg-[#1c1c1e] border border-black/5 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8">Gestión</h3>
                    <div className="space-y-4">
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="w-full py-4 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          <i className="bi bi-trash3 mr-2"></i> Eliminar Anuncio
                        </button>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </main>

      {/* MODAL EDICIÓN */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-[3rem] p-10 overflow-y-auto max-h-[90vh] shadow-2xl border border-white/10 no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic tracking-tighter underline decoration-primary decoration-4">Editar Anuncio</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-60 italic">Título</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none outline-none font-bold focus:ring-2 ring-primary/20"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-black/5">
                   <input
                      type="checkbox"
                      id="isPublicEdit"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                      className="w-5 h-5 accent-primary cursor-pointer"
                   />
                   <label htmlFor="isPublicEdit" className="text-[10px] font-black uppercase cursor-pointer">
                      ¿Es un comunicado público?
                   </label>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-60 italic">Imagen de Cabecera (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none outline-none font-bold focus:ring-2 ring-primary/20 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase ml-1 opacity-60 italic">Contenido del Anuncio</label>
                  <textarea
                    rows={8}
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none outline-none font-bold resize-none focus:ring-2 ring-primary/20"
                    required
                  />
                </div>

                <div className="pt-6 border-t border-black/5">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {editLoading ? "Actualizando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#1c1c1e] p-10 rounded-[3rem] max-w-sm text-center shadow-2xl border border-white/10">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-trash3-fill text-3xl"></i>
              </div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tighter italic">¿Eliminar Anuncio?</h3>
              <p className="text-xs text-muted-foreground mb-8">Esta acción no se puede deshacer y el anuncio desaparecerá del feed de los usuarios.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg">Eliminar Permanentemente</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-opacity">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}