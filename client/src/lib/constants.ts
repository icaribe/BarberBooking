export const API_ENDPOINTS = {
  USERS: '/api/users',
  SERVICE_CATEGORIES: '/api/service-categories',
  SERVICES: '/api/services',
  PROFESSIONALS: '/api/professionals',
  SCHEDULES: '/api/professionals/:professionalId/schedules',
  APPOINTMENTS: '/api/appointments',
  APPOINTMENT_SERVICES: '/api/appointment-services',
  PRODUCT_CATEGORIES: '/api/product-categories',
  PRODUCTS: '/api/products',
  LOYALTY_REWARDS: '/api/loyalty-rewards',
};

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const BUSINESS_HOURS = {
  open: '09:00',
  close: '18:00',
  lunchStart: '13:00',
  lunchEnd: '14:30'
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};