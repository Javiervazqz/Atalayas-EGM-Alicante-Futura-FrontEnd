'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      
      if (role === 'GENERAL_ADMIN') router.push('/dashboard/administrator/general-admin');
      else if (role === 'ADMIN') router.push('/dashboard/administrator/admin');
      else if (role === 'EMPLOYEE') router.push('/dashboard/employee');
      else router.push('/dashboard/public');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // bg-background llama a tu fondo color arena/piedra del globals.css
    <div className="min-h-screen flex flex-col bg-background font-sans">
      
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          {/* bg-primary usa tu verde azulado corporativo */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shadow-sm">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            Atalayas
          </span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="rounded-3xl px-10 py-12 bg-card shadow-xl border border-border">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-primary shadow-md">
                <span className="text-primary-foreground text-2xl font-bold">A</span>
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight mb-1.5">
                Iniciar sesión
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Polígono Industrial Alicante Futura
              </p>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-6 text-center bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                  // Estilos de Tailwind para los inputs integrados con tu globals.css
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                // bg-secondary llama a tu color Naranja Terracota
                className="w-full bg-secondary text-secondary-foreground font-semibold rounded-xl px-4 py-3 text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Iniciando sesión...' : 'Continuar'}
              </button>
            </form>

            <div className="text-center mt-6">
              <a href="#" className="text-primary text-sm font-medium hover:underline transition-all">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Footer notes */}
          <p className="text-center mt-8 text-muted-foreground text-xs leading-relaxed">
            ¿Eres empleado de una empresa del polígono?<br />
            Contacta con tu administrador para obtener acceso.
          </p>

          <p className="text-center mt-4 text-muted-foreground text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline transition-all">
              Regístrate
            </Link>
          </p>

          <p className="text-center mt-2 text-muted-foreground text-sm">
            ¿Eres una empresa del polígono?{' '}
            <Link href="/company-register" className="text-primary font-medium hover:underline transition-all">
              Solicitar alta
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6">
        <div className="flex items-center justify-center gap-6">
          {['Privacidad', 'Términos', 'Contacto'].map((item) => (
            <a key={item} href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
        </div>
        <p className="text-center mt-4 text-muted-foreground/60 text-xs">
          © 2026 Atalayas EGM Alicante Futura
        </p>
      </footer>
    </div>
  );
}