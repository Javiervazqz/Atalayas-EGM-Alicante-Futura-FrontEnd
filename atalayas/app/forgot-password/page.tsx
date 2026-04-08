'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ajusta esta ruta según tu backend de NestJS
      const res = await fetch(`${API_ROUTES.AUTH.FORGOT_PASSWORD}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'No se pudo enviar el correo');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: '#f5f5f7',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link href="/login" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #434343 100%)' }}
          >
            <span className="text-white text-xs font-semibold">A</span>
          </div>
          <span style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Atalayas
          </span>
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          
          <div
            className="rounded-3xl px-10 py-12"
            style={{
              background: '#ffffff',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          >
            <div className="text-center mb-10">
              <h1
                style={{
                  color: '#1d1d1f',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  marginBottom: '12px',
                }}
              >
                Recuperar contraseña
              </h1>
              <p style={{ color: '#86868b', fontSize: '15px', fontWeight: 400, lineHeight: '1.4' }}>
                {submitted 
                  ? 'Revisa tu bandeja de entrada para restablecer tu contraseña.'
                  : 'Introduce tu correo y te enviaremos instrucciones.'}
              </p>
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 mb-6 text-center"
                style={{ background: '#fff2f2', border: '1px solid #ffd0d0' }}
              >
                <p style={{ color: '#ff3b30', fontSize: '13px' }}>{error}</p>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    style={{
                      width: '100%',
                      background: '#f5f5f7',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      padding: '13px 16px',
                      fontSize: '15px',
                      color: '#1d1d1f',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#86868b' : '#0071e3',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Enviando...' : 'Recuperar contraseña'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <Link
                  href="/login"
                  style={{
                    display: 'block',
                    width: '100%',
                    background: '#0071e3',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    fontSize: '15px',
                    fontWeight: 500,
                  }}
                >
                  Volver al login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer minimalista similar al original */}
      <footer className="px-8 py-6">
        <p className="text-center" style={{ color: '#b0b0b5', fontSize: '11px' }}>
          © 2026 Atalayas EGM Alicante Futura
        </p>
      </footer>
    </div>
  );
}