'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => router.push('/login'), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          
          <div className="rounded-3xl px-10 py-12 bg-card shadow-xl border border-border">
            <div className="text-center mb-10">
              <h1 className="text-foreground text-2xl font-bold tracking-tight mb-3">
                Nueva contraseña
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {success 
                  ? 'Contraseña actualizada. Redirigiendo...' 
                  : 'Crea una contraseña segura para tu cuenta.'}
              </p>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-6 text-center bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-4">
                <div className="text-primary text-5xl mb-4"><i className="bi bi-check-circle-fill"></i></div>
                <p className="text-foreground font-medium">¡Todo listo!</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-secondary-foreground font-semibold rounded-xl px-4 py-3 text-sm mt-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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