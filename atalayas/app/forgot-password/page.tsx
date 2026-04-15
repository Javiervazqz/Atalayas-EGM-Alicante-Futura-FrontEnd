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
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shadow-sm">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            Atalayas
          </span>
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl px-10 py-12 bg-card shadow-xl border border-border">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-primary shadow-md">
                <i className="bi bi-key text-primary-foreground text-2xl"></i>
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight mb-1.5">
                Recuperar contraseña
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {submitted 
                  ? 'Revisa tu bandeja de entrada para restablecer tu contraseña.'
                  : 'Introduce tu correo y te enviaremos instrucciones.'}
              </p>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-6 text-center bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-secondary-foreground font-semibold rounded-xl px-4 py-3 text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Enviando...' : 'Recuperar contraseña'}
                </button>
              </form>
            ) : (
              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="block w-full bg-secondary text-secondary-foreground font-semibold rounded-xl px-4 py-3 text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                  Volver al login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6">
        <p className="text-center text-muted-foreground/60 text-xs">
          © 2026 Atalayas EGM Alicante Futura
        </p>
      </footer>
    </div>
  );
}