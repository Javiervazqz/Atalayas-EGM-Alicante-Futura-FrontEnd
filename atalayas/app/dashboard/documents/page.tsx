'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';

export default function DocumentsExplorerPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. CARGA INICIAL DE DOCUMENTOS
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) return;
        
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        const res = await fetch(API_ROUTES.DOCUMENTS.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar los documentos');
        
        const data = await res.json();
        const docsArray = Array.isArray(data) ? data : (data.data || []);
        setDocuments(docsArray);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // 2. FUNCIÓN PARA ELIMINAR DOCUMENTOS
  const handleDelete = async (docId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Asegúrate de que la ruta API_ROUTES.DOCUMENTS.GET_ALL apunta a la raíz de tu endpoint (ej: /document)
      const res = await fetch(`${API_ROUTES.DOCUMENTS.GET_ALL}/${docId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el documento');
      }

      // Quitamos el documento borrado de la lista local
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      
      // Si el documento borrado era el que estábamos viendo, deseleccionamos
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }

    } catch (err: any) {
      alert(err.message);
    }
  };

  // 3. BUSCADOR INTELIGENTE EN TIEMPO REAL
  const visibleDocs = documents.filter(doc => {
    // Primero: Filtro de seguridad (por si acaso el backend manda algo de más)
    if (currentUser?.role === 'ADMIN') {
      const isMyCompany = String(doc.companyId) === String(currentUser.companyId);
      if (!doc.isPublic && !isMyCompany) return false;
    }

    // Segundo: Filtro de búsqueda al vuelo
    if (searchTerm.trim() !== '') {
      // Normalizamos ambos textos: los pasamos a minúsculas y les quitamos los acentos/tildes
      const normalizedTitle = doc.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normalizedSearch = searchTerm.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      // Comprobamos si el título contiene lo que estamos escribiendo
      return normalizedTitle.includes(normalizedSearch);
    }

    return true; // Si la barra de búsqueda está vacía, mostramos todos
  });

  // 4. AUTO-SELECCIÓN FLUÍDA
  useEffect(() => {
    // Si la lista filtrada tiene cosas, y el documento que estamos viendo ya no está en esa lista (porque lo hemos filtrado fuera)
    if (visibleDocs.length > 0 && (!selectedDoc || !visibleDocs.some(d => d.id === selectedDoc.id))) {
      setSelectedDoc(visibleDocs[0]); // Saltamos automáticamente al primer resultado de la búsqueda
    } else if (visibleDocs.length === 0) {
      setSelectedDoc(null); // Si la búsqueda no devuelve nada, vaciamos el visor derecho
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, documents]); // Re-evaluamos en cada pulsación de tecla
  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role={currentUser.role} />
      
      <main className="flex-1 flex overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: Lista de Documentos */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
          
          <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Documentos</h1>
              
              <Link href="/dashboard/documents/new">
                <button 
                  className="bg-[#0071e3] text-white p-2 rounded-lg hover:bg-[#0077ed] transition-colors shadow-sm"
                  title="Subir nuevo documento"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </Link>
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar archivo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl text-sm outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>

          {/* Lista de archivos */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-[#86868b]">Cargando...</div>
            ) : visibleDocs.length > 0 ? (
              visibleDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full flex flex-col text-left px-4 py-3 rounded-xl transition-all ${
                    selectedDoc?.id === doc.id 
                      ? 'bg-[#0071e3] text-white shadow-md' 
                      : 'hover:bg-[#f5f5f7] text-[#1d1d1f]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate pr-2">{doc.title}</span>
                    {doc.isPublic ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${selectedDoc?.id === doc.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>Pub</span>
                    ) : (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${selectedDoc?.id === doc.id ? 'bg-black/20 text-white' : 'bg-gray-200 text-gray-600'}`}>Priv</span>
                    )}
                  </div>
                  <span className={`text-xs ${selectedDoc?.id === doc.id ? 'text-blue-100' : 'text-[#86868b]'}`}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-[#86868b]">No se encontraron documentos.</div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Visor del Documento */}
        <div className="flex-1 bg-[#f5f5f7] flex flex-col relative overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Barra superior del visor */}
              <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1d1d1f]">{selectedDoc.title}</h2>
                  <span className="text-xs font-medium text-[#86868b] bg-gray-100 px-2 py-1 rounded-md">
                    {selectedDoc.isPublic ? 'Acceso Público' : 'Documento Privado'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={selectedDoc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Abrir en nueva pestaña
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  
                  {/* 🚀 NUEVO BOTÓN DE ELIMINAR */}
                  {(currentUser.role === 'ADMIN' || currentUser.role === 'GENERAL_ADMIN') && (
                    <button 
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100 ml-2"
                      title="Eliminar documento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* ÁREA DEL DOCUMENTO A PANTALLA COMPLETA */}
              <div className="flex-1 w-full h-full bg-white overflow-hidden">
                <iframe 
                  src={selectedDoc.fileUrl} 
                  className="w-full h-full border-none block"
                  title={selectedDoc.title}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b]">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-lg font-medium">Selecciona un documento para visualizarlo</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}