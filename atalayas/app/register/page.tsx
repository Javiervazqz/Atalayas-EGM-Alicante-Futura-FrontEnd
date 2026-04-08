'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

<<<<<<< HEAD
export default function RegisterPage() {
=======
export default function RegisterPage() { 
>>>>>>> dc0bd06e81eb286ec62af1d92dff20391082e938
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrarse');

      router.push('/login?registered=true');
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
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #434343 100%)' }}
          >
            <span className="text-white text-xs font-semibold">A</span>
          </div>
          <span style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Atalayas
          </span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div
            className="rounded-3xl px-10 py-12"
            style={{
              background: '#ffffff',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          >
            <div className="text-center mb-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #434343 100%)' }}
              >
                <span className="text-white text-2xl font-semibold">A</span>
              </div>
              <h1
                style={{
                  color: '#1d1d1f',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  marginBottom: '6px',
                }}
              >
                Crear cuenta
              </h1>
              <p style={{ color: '#86868b', fontSize: '14px', fontWeight: 400 }}>
                Accede a los servicios del polígono
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

            <form onSubmit={handleRegister} className="space-y-3">
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
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #0071e3';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(0,0,0,0.08)';
                    e.target.style.background = '#f5f5f7';
                  }}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
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
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #0071e3';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(0,0,0,0.08)';
                    e.target.style.background = '#f5f5f7';
                  }}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar contraseña"
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
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #0071e3';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(0,0,0,0.08)';
                    e.target.style.background = '#f5f5f7';
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
                  marginTop: '8px',
                  transition: 'background 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#0077ed';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#0071e3';
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>

          <p className="text-center mt-6" style={{ color: '#86868b', fontSize: '13px' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#0071e3', textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </p>

          <p className="text-center mt-4" style={{ color: '#86868b', fontSize: '12px', lineHeight: '1.6' }}>
            ¿Eres empleado de una empresa del polígono?<br />
            Contacta con tu administrador para obtener acceso.
          </p>
        </div>
      </main>
    </div>
  );
}