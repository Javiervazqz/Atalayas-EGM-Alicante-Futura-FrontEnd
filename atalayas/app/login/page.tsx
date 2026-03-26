'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Importamos nuestras rutas limpias (ya NO importamos supabase)
import { API_ROUTES } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    /*djnjfndj */
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Volvemos a llamar a TU backend de NestJS
      const res = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      // Tu backend ya nos devuelve el token y el rol correctos desde Prisma
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      
      // Redirigimos
      if (role === 'GENERAL_ADMIN') router.push('/dashboard/general-admin');
      else if (role === 'ADMIN') router.push('/dashboard/admin');
      else if (role === 'EMPLOYEE') router.push('/dashboard/employee');
      else router.push('/dashboard/public');
      
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
                Iniciar sesión
              </h1>
              <p style={{ color: '#86868b', fontSize: '14px', fontWeight: 400 }}>
                Polígono Industrial Alicante Futura
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

            <form onSubmit={handleLogin} className="space-y-3">
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
                {loading ? 'Iniciando sesión...' : 'Continuar'}
              </button>
            </form>

            <div className="text-center mt-6">
              <a
                href="#"
                style={{ color: '#0071e3', fontSize: '13px', textDecoration: 'none' }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center mt-6" style={{ color: '#86868b', fontSize: '12px', lineHeight: '1.6' }}>
            ¿Eres empleado de una empresa del polígono?<br />
            Contacta con tu administrador para obtener acceso.
          </p>

          <p className="text-center mt-4" style={{ color: '#86868b', fontSize: '13px' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: '#0071e3', textDecoration: 'none' }}>
              Regístrate
            </Link>
          </p>

          <p className="text-center mt-2" style={{ color: '#86868b', fontSize: '13px' }}>
            ¿Eres una empresa del polígono?{' '}
            <Link href="/company-register" style={{ color: '#0071e3', textDecoration: 'none' }}>
              Solicitar alta
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6">
        <div className="flex items-center justify-center gap-6">
          {['Privacidad', 'Términos', 'Contacto'].map((item) => (
            <a
              key={item}
              href="#"
              style={{ color: '#86868b', fontSize: '12px', textDecoration: 'none' }}
            >
              {item}
            </a>
          ))}
        </div>
        <p className="text-center mt-3" style={{ color: '#b0b0b5', fontSize: '11px' }}>
          © 2026 Atalayas EGM Alicante Futura
        </p>
      </footer>
    </div>
  );
}