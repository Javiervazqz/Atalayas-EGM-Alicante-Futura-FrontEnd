'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_ROUTES.SERVICES.GET_ALL}/${params.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setService(data);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!service) return null;

  const isBooking = service.serviceType === 'BOOKING';
  const accentColor = isBooking ? '#af52de' : '#0071e3';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
      <Sidebar role="EMPLOYEE" />
      
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <button 
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '24px', padding: 0 }}
            >
              ‹ Volver a servicios
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '72px', height: '72px', background: isBooking ? 'rgba(175,82,222,0.1)' : 'rgba(0,113,227,0.1)',
                borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0
              }}>
                {isBooking ? '📅' : 'ℹ️'}
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', margin: 0 }}>
                  {service.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="content-layout">
            
            {/* TEXTO PRINCIPAL */}
            <div className="main-text">
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>Sobre el servicio</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#424245', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
                {service.description || 'No hay una descripción detallada disponible para este servicio en este momento.'}
              </p>

              {/* SECCIÓN DE ACCIÓN INTEGRADA (Aparece aquí en móvil) */}
              {isBooking ?
              <div className="action-box">
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio</span>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#1d1d1f', margin: 0 }}>Gratuito</p>
                </div>
                
                <button style={{
                  width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                  background: accentColor, color: '#fff',
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: `0 4px 15px ${isBooking ? 'rgba(175,82,222,0.2)' : 'rgba(0,113,227,0.2)'}`,
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                Reservar
                </button>
              </div> : (
                <button style={{
                  width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                  background: accentColor, color: '#fff',
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: `0 4px 15px ${isBooking ? 'rgba(175,82,222,0.2)' : 'rgba(0,113,227,0.2)'}`,
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                Consultar Información
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 60px;
        }

        .action-box {
          background: #fff;
          padding: 32px;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          height: fit-content;
        }

        @media (min-width: 1025px) {
          .action-box {
            position: sticky;
            top: 40px;
          }
        }

        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .action-box {
            margin-top: 20px;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}