'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Captura el token de ?token=xxx

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Si no hay token, redirigimos al login por seguridad
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleReset = async (e: React.FormEvent) => {
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
      const res = await fetch(`${API_ROUTES.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña');

      setSuccess(true);
      // Redirigir al login tras 3 segundos
      setTimeout(() => router.push('/login'), 3000);
      
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
                Nueva contraseña
              </h1>
              <p style={{ color: '#86868b', fontSize: '15px' }}>
                {success 
                  ? 'Contraseña actualizada. Redirigiendo...' 
                  : 'Crea una contraseña segura para tu cuenta.'}
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

            {success ? (
              <div className="text-center py-4">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p style={{ color: '#1d1d1f', fontWeight: 500 }}>¡Todo listo!</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    background: loading ? '#86868b' : '#0071e3',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Estilos rápidos para mantener el código limpio
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#f5f5f7',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '13px 16px',
  fontSize: '15px',
  color: '#1d1d1f',
  outline: 'none',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '13px 16px',
  fontSize: '15px',
  fontWeight: 500,
  transition: 'background 0.2s',
  fontFamily: 'inherit',
  marginTop: '10px'
};