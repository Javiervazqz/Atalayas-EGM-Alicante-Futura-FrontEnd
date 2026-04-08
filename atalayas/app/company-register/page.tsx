'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/lib/utils';

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

const inputStyle = {
  width: '100%',
  background: '#f5f5f7',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '13px 16px',
  fontSize: '15px',
  color: '#1d1d1f',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: appleFont,
};

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
    setFieldErrors({})

    const newErrors: Record<string, string> = {};

    if(!form.companyName) newErrors.companyName = 'El nombre es obligatorio';
    
    if(!form.cif){
      newErrors.cif = 'El CIF es obligatorio';
    } else if(!/^[ABCDEFGHJKLMNPQSVW]\d{7}[0-9A-J]$/i.test(form.cif)) {
      newErrors.cif = 'El formato del CIF no es válido (ej: B12345678)';
    }

    if (!form.contactEmail) {
      newErrors.contactEmail = 'El email es obligatorio';
     } else if (!/\S+@\S+\.\S+/.test(form.contactEmail)){
      newErrors.contactEmail = 'Introduce un email válido';
    }

    if(!form.contactName) newErrors.contactName = 'El nombre del responsable es obligatorio';

    if(form.phone && !/^\+?[\d\s]{9,}$/.test(form.phone)){
      newErrors.phone = 'El teléfono no parece válido'
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Por favor, revisa los campos marcados en rojo');
      window.scrollTo({top:0, behavior: 'smooth'})
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

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(52,199,89,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
            ✅
          </div>
          <h2 style={{ color: '#1d1d1f', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
            Solicitud enviada
          </h2>
          <p style={{ color: '#86868b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 28px' }}>
            Hemos recibido tu solicitud. El equipo de Atalayas la revisará y recibirás un email con la respuesta en breve.
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            background: '#0071e3',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
          }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const renderInput = (name: string, placeholder: string, type = 'text', required= false) =>{
    const hasError = !!fieldErrors[name];
    return (
      <div style={{ marginBottom: '4px' }}>
        <input
          name={name}
          type={type}
          value={(form as any)[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          style={{
            ...inputStyle,
            border: hasError ? '1px solid #ff3b30' : '1px solid rgba(0,0,0,0.08)',
            background: hasError ? '#fff2f2' : '#f5f5f7',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => { 
            if(!hasError) {
              e.target.style.border = '1px solid #0071e3'; 
              e.target.style.background = '#fff'; 
            }
          }}
          onBlur={(e) => { 
            if(!hasError) {
              e.target.style.border = '1px solid rgba(0,0,0,0.08)'; 
              e.target.style.background = '#f5f5f7'; 
            }
          }}
        />
        {hasError && (
          <span style={{ color: '#ff3b30', fontSize: '12px', marginLeft: '4px', marginTop: '2px', display: 'block', fontWeight: 500 }}>
            {fieldErrors[name]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #1d1d1f 0%, #434343 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>A</span>
          </div>
          <span style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.02em' }}>Atalayas</span>
        </div>
        <Link href="/login" style={{ color: '#0071e3', fontSize: '14px', textDecoration: 'none' }}>
          Iniciar sesión
        </Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 24px 60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#1d1d1f', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 8px' }}>
            Solicitar alta de empresa
          </h1>
          <p style={{ color: '#86868b', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
            Rellena el formulario para solicitar acceso al polígono industrial. Revisaremos tu solicitud y nos pondremos en contacto contigo.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fff2f2', border: '1px solid #ffd0d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
            <p style={{ color: '#ff3b30', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Datos de la empresa */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
            <h3 style={{ color: '#1d1d1f', fontSize: '15px', fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Datos de la empresa
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {renderInput('companyName', 'Nombre de la empresa', 'text', true)}
              {renderInput('cif', 'CIF (ej: B12345678)', 'text', true)}
              {renderInput('activity', 'Sector / Actividad (opcional)')}
              {renderInput('address', 'Dirección en el polígono (opcional)')}
            </div>
          </div>

          {/* Datos de contacto */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
            <h3 style={{ color: '#1d1d1f', fontSize: '15px', fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Datos de contacto
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             {renderInput('contactName', 'Nombre del responsable', 'text', true)}
              {renderInput('contactEmail', 'Email de contacto', 'email', true)}
              {renderInput('phone', 'Teléfono (opcional)', 'tel')}
            </div>
          </div>

          {/* Documento acreditativo */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
            <h3 style={{ color: '#1d1d1f', fontSize: '15px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Documento acreditativo
            </h3>
            <p style={{ color: '#86868b', fontSize: '12px', margin: '0 0 16px' }}>
              Adjunta un documento que acredite tu pertenencia al polígono (contrato de arrendamiento, escrituras, etc.)
            </p>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '24px', borderRadius: '12px',
              border: `2px dashed ${file ? '#34c759' : 'rgba(0,0,0,0.12)'}`,
              background: file ? 'rgba(52,199,89,0.04)' : '#f5f5f7',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '24px' }}>{file ? '✅' : '📄'}</span>
              <span style={{ color: file ? '#34c759' : '#86868b', fontSize: '13px', fontWeight: 500 }}>
                {file ? file.name : 'Haz clic para seleccionar archivo'}
              </span>
              <span style={{ color: '#b0b0b5', fontSize: '11px' }}>PDF, Word o imagen (máx. 10MB)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#86868b' : '#0071e3',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: appleFont,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Enviando solicitud...' : 'Enviar solicitud'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#86868b', fontSize: '13px', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: '#0071e3', textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </p>
      </main>
    </div>
  );
}