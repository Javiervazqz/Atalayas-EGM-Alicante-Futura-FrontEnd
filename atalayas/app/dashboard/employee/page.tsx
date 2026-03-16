'use client';
 
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
 
interface Course {
  id: string;
  title: string;
  isPublic: boolean;
}
 
interface Enrollment {
  id: string;
  progress: number;
  Course: Course;
}
 
const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
 
function Sidebar({ active }: { active: string }) {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
 
  const navItems = [
    { label: 'Panel', href: '/dashboard/employee', icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor"/></svg>
    )},
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13M4 19a2 2 0 002 2h12a2 2 0 002-2M4 19H2m20 0h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { label: 'Documentos', href: '/dashboard/employee/documents', icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { label: 'Servicios', href: '/dashboard/employee/services', icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
  ];
 
  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: appleFont,
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #1d1d1f 0%, #434343 100%)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>A</span>
          </div>
          <div>
            <p style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: 600, margin: 0 }}>Atalayas</p>
            <p style={{ color: '#86868b', fontSize: '11px', margin: 0 }}>Polígono Industrial</p>
          </div>
        </div>
      </div>
 
      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map((item) => {
          const isActive = active === item.label;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                marginBottom: '2px',
                background: isActive ? 'rgba(0,113,227,0.08)' : 'transparent',
                color: isActive ? '#0071e3' : '#424245',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
 
      {/* User */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: '#f5f5f7',
          marginBottom: '6px',
        }}>
          <div style={{
            width: '30px', height: '30px',
            background: '#e8e8ed',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#424245', fontSize: '12px', fontWeight: 600 }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#1d1d1f', fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email || 'Usuario'}
            </p>
            <p style={{ color: '#86868b', fontSize: '11px', margin: 0 }}>Empleado</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px 12px',
            border: 'none', borderRadius: '10px',
            background: 'transparent', color: '#ff3b30',
            fontSize: '13px', cursor: 'pointer',
            textAlign: 'left', fontFamily: appleFont,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
 
export default function EmployeeDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
 
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const coursesRes = await fetch('http://localhost:3000/courses', { headers });
        const coursesData = await coursesRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
 
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
 
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: appleFont }}>
      <Sidebar active="Panel" />
 
      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
 
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ color: '#1d1d1f', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 6px' }}>
            Buenos días
          </h1>
          <p style={{ color: '#86868b', fontSize: '15px', margin: 0 }}>
            Consulta tus cursos y tu progreso de formación
          </p>
        </div>
 
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Cursos disponibles', value: courses.length, sub: 'para ti', color: '#0071e3', bg: 'rgba(0,113,227,0.06)' },
            { label: 'En progreso', value: inProgressCourses, sub: 'cursos activos', color: '#ff9500', bg: 'rgba(255,149,0,0.06)' },
            { label: 'Completados', value: completedCourses, sub: 'cursos terminados', color: '#34c759', bg: 'rgba(52,199,89,0.06)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: stat.bg,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: stat.color, opacity: 0.8 }} />
              </div>
              <p style={{ color: '#1d1d1f', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 4px' }}>
                {loading ? '—' : stat.value}
              </p>
              <p style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: 500, margin: '0 0 2px' }}>{stat.label}</p>
              <p style={{ color: '#86868b', fontSize: '12px', margin: 0 }}>{stat.sub}</p>
            </div>
          ))}
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
 
          {/* Cursos disponibles */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                Cursos disponibles
              </h2>
              <Link href="/dashboard/employee/courses" style={{ color: '#0071e3', fontSize: '13px', textDecoration: 'none' }}>
                Ver todos
              </Link>
            </div>
 
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: '56px', background: '#f5f5f7', borderRadius: '12px' }} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ color: '#86868b', fontSize: '14px' }}>No hay cursos disponibles</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {courses.slice(0, 5).map((course) => (
                  <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#f5f5f7',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ebebed')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f5f5f7')}
                    >
                      <div style={{
                        width: '34px', height: '34px',
                        background: course.isPublic ? 'rgba(52,199,89,0.12)' : 'rgba(0,113,227,0.1)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '16px',
                      }}>
                        📚
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.title}
                        </p>
                        <p style={{ color: course.isPublic ? '#34c759' : '#86868b', fontSize: '11px', margin: 0 }}>
                          {course.isPublic ? 'Público' : 'Tu empresa'}
                        </p>
                      </div>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ color: '#c7c7cc', flexShrink: 0 }}>
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
 
          {/* Mi progreso */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ color: '#1d1d1f', fontSize: '17px', fontWeight: 600, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Mi progreso
            </h2>
 
            {enrollments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: '56px', height: '56px',
                  background: '#f5f5f7',
                  borderRadius: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '26px',
                }}>
                  🎯
                </div>
                <p style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: 500, margin: '0 0 6px' }}>
                  Sin matrículas activas
                </p>
                <p style={{ color: '#86868b', fontSize: '13px', margin: '0 0 16px' }}>
                  Empieza un curso para ver tu progreso aquí
                </p>
                <Link href="/dashboard/employee/courses" style={{
                  color: '#0071e3', fontSize: '13px', textDecoration: 'none',
                  padding: '8px 16px',
                  background: 'rgba(0,113,227,0.08)',
                  borderRadius: '20px',
                }}>
                  Explorar cursos
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#1d1d1f', fontSize: '14px', fontWeight: 500 }}>
                        {enrollment.Course.title}
                      </span>
                      <span style={{ color: '#86868b', fontSize: '13px' }}>{enrollment.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#f5f5f7', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${enrollment.progress}%`,
                        background: enrollment.progress === 100 ? '#34c759' : '#0071e3',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}