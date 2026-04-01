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
    PROFILE: `${BASE_URL}/auth/profile`,
  },
  USERS: {
    GET_ALL: `${BASE_URL}/users`,
  },
  COURSES: {
    GET_ALL: `${BASE_URL}/courses`,
  },
  DOCUMENTS: {
    GET_ALL: `${BASE_URL}/document`,
  },
  SERVICES: {
    GET_ALL: `${BASE_URL}/services`,
    CREATE: `${BASE_URL}/services`,
    GET_BY_ID: (id: string) => `${BASE_URL}/services/${id}`,
  },
  COMPANIES: {
    GET_ALL: `${BASE_URL}/company`,
    GET_BY_ID: (id: string) => `${BASE_URL}/company/${id}`,
  },
  ANNOUNCEMENTS: {
    GET_ALL: `${BASE_URL}/announcement`
  },
  COMPANY_REQUESTS: {
    CREATE: `${BASE_URL}/company-request`,
    GET_ALL: `${BASE_URL}/company-request`,
    APPROVE: (id: string) => `${BASE_URL}/company-request/${id}/approve`,
    REJECT: (id: string) => `${BASE_URL}/company-request/${id}/reject`,
    ARCHIVE: (id: string) => `${BASE_URL}/company-request/${id}/archive`,
    UNARCHIVE: (id: string) => `${BASE_URL}/company-request/${id}/unarchive`,
    GET_ARCHIVED: `${BASE_URL}/company-request?archived=true`,
  },
  CHATBOT: {
    SEND:`${BASE_URL}/chatbot`
  }
}
