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
    CREATE: `${BASE_URL}/users`,
    ONBOARDING_DONE: `${BASE_URL}/users/me/onboarding-done`,
  },
  COURSES: {
    GET_ALL: `${BASE_URL}/courses`,
    CREATE: `${BASE_URL}/courses`,
    GET_BY_ID: (id:string) => `${BASE_URL}/courses/${id}`
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
  CONTENT: {
    GET_ALL: (courseId: string) => `${BASE_URL}/courses/${courseId}/content`,
    CREATE: (courseId: string) => `${BASE_URL}/courses/${courseId}/content`,
    GET_BY_ID: (contentId: string,) => `${BASE_URL}/courses/}/content/${contentId}`,
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

ONBOARDING: {
  SETUP:`${BASE_URL}/onboarding/setup`,
  ME:`${BASE_URL}/onboarding/me`,
  TOGGLE: `${BASE_URL}/onboarding/toggle`,
},

  CHATBOT: {
    SEND:`${BASE_URL}/chatbot`
  }
}
