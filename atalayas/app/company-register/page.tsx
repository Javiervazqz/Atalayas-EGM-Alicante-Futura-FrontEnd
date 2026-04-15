'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/lib/utils';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    companyName: '',
    cif: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    activity: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newErrors: Record<string, string> = {};

    if (!form.companyName) newErrors.companyName = 'El nombre es obligatorio';
    
    if (!form.cif) {
      newErrors.cif = 'El CIF es obligatorio';
    } else if (!/^[ABCDEFGHJKLMNPQSVW]\d{7}[0-9A-J]$/i.test(form.cif)) {
      newErrors.cif = 'El formato del CIF no es válido (ej: B12345678)';
    }

    if (!form.contactEmail) {
      newErrors.contactEmail = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Introduce un email válido';
    }

    if (!form.contactName) newErrors.contactName = 'El nombre del responsable es obligatorio';

    if (form.phone && !/^\+?[\d\s]{9,}$/.test(form.phone)) {
      newErrors.phone = 'El teléfono no parece válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Por favor, revisa los campos marcados en rojo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!file) {
      setError('Debes adjuntar un documento acreditativo');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      formData.append('document', file);

      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.CREATE, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al enviar la solicitud');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── ESTADO DE ÉXITO ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center p-6">
        <div className="bg-card rounded-3xl p-10 lg:p-12 max-w-md w-full text-center shadow-2xl border border-border animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl text-emerald-500 shadow-sm border border-emerald-500/20">
            <i className="bi bi-check-lg"></i>
          </div>
          <h2 className="text-foreground text-2xl lg:text-3xl font-extrabold mb-3 tracking-tight">
            Solicitud enviada
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Hemos recibido tu solicitud. El equipo de Atalayas la revisará detalladamente y recibirás un email con la respuesta en breve.
          </p>
          <Link 
            href="/login" 
            className="inline-block w-full bg-secondary text-secondary-foreground rounded-2xl px-6 py-4 text-sm font-bold transition-all hover:opacity-90 shadow-sm active:scale-95"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ── GENERADOR DE INPUTS ────────────────────────────────────────────────────
  const renderInput = (name: string, placeholder: string, type = 'text', required = false) => {
    const hasError = !!fieldErrors[name];
    return (
      <div className="mb-1">
        <input
          name={name}
          type={type}
          value={(form as any)[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-background rounded-xl px-5 py-4 text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground/50 font-medium ${
            hasError 
              ? 'border-2 border-destructive bg-destructive/5' 
              : 'border-2 border-transparent focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring border-input'
          }`}
        />
        {hasError && (
          <span className="text-destructive text-xs font-bold ml-2 mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
            <i className="bi bi-exclamation-triangle-fill"></i> {fieldErrors[name]}
          </span>
        )}
      </div>
    );
  };

  // ── VISTA PRINCIPAL (FORMULARIO) ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground text-sm font-extrabold">A</span>
          </div>
          <span className="text-foreground text-xl font-bold tracking-tight">Atalayas</span>
        </div>
        <Link href="/login" className="text-primary text-sm font-bold hover:underline transition-all flex items-center gap-1">
          Iniciar sesión <i className="bi bi-arrow-right"></i>
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 pb-20 w-full flex-1">
        <div className="mb-10 mt-4 text-center sm:text-left">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Solicitar alta de empresa
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Rellena el formulario para solicitar acceso al polígono industrial. Revisaremos tu solicitud y nos pondremos en contacto contigo.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 mb-8 flex items-center gap-3 animate-in fade-in">
            <i className="bi bi-exclamation-octagon-fill text-2xl text-destructive"></i>
            <p className="text-destructive text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* Datos de la empresa */}
          <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
            <h3 className="text-foreground text-lg font-bold mb-5 tracking-tight border-l-4 border-primary pl-3">
              Datos de la empresa
            </h3>
            <div className="flex flex-col gap-4">
              {renderInput('companyName', 'Nombre de la empresa *', 'text', true)}
              {renderInput('cif', 'CIF (ej: B12345678) *', 'text', true)}
              {renderInput('activity', 'Sector / Actividad (Opcional)')}
              {renderInput('address', 'Dirección en el polígono (Opcional)')}
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
            <h3 className="text-foreground text-lg font-bold mb-5 tracking-tight border-l-4 border-primary pl-3">
              Datos de contacto
            </h3>
            <div className="flex flex-col gap-4">
              {renderInput('contactName', 'Nombre del responsable *', 'text', true)}
              {renderInput('contactEmail', 'Email de contacto *', 'email', true)}
              {renderInput('phone', 'Teléfono (Opcional)', 'tel')}
            </div>
          </div>

          {/* Documento acreditativo */}
          <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
            <h3 className="text-foreground text-lg font-bold mb-2 tracking-tight border-l-4 border-primary pl-3">
              Documento acreditativo
            </h3>
            <p className="text-muted-foreground text-xs font-medium mb-6 ml-4">
              Adjunta un documento que acredite tu pertenencia al polígono (contrato de arrendamiento, escrituras, etc.)
            </p>
            
            <label className={`relative flex flex-col items-center justify-center gap-2 p-8 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group ${
                file 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-border bg-background hover:bg-muted hover:border-primary/50'
              }`}
            >
              <span className={`text-4xl mb-2 transition-transform group-hover:scale-110 ${file ? 'text-emerald-500' : 'text-primary'}`}>
                <i className={`bi ${file ? 'bi-check-circle-fill' : 'bi-file-earmark-arrow-up'}`}></i>
              </span>
              <span className={`text-sm font-bold text-center ${file ? 'text-emerald-600' : 'text-foreground'}`}>
                {file ? file.name : 'Haz clic para seleccionar archivo'}
              </span>
              {!file && <span className="text-muted-foreground text-xs font-medium mt-1">PDF, Word o imagen (máx. 10MB)</span>}
              
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 lg:py-5 bg-secondary text-secondary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="bi bi-arrow-repeat animate-spin text-xl"></i> Enviando solicitud...</>
              ) : (
                'Enviar solicitud'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-8 font-medium">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline transition-all">
            Iniciar sesión
          </Link>
        </p>
      </main>
    </div>
  );
}