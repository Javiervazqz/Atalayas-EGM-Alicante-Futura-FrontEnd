import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  },
  USERS: {
    GET_ALL: `${BASE_URL}/users`,
  },
  COURSES: {
    GET_ALL: `${BASE_URL}/courses`,
  },
  DOCUMENTS: {
    GET_ALL: `${BASE_URL}/document`,
  }
}

// AÑADIMOS SUPABASE AQUÍ ABAJO:
// Intentamos leer del .env.local, si falla, usamos las tuyas directamente
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pbwxtcltzhdyugjdrshx.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBid3h0Y2x0emhkeXVnamRyc2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTQ1NTQsImV4cCI6MjA4ODAzMDU1NH0.S8rSTqYjeJZ-nTfpz5Y7JkkcsQPxIuSPCdlBiFO0IhI';