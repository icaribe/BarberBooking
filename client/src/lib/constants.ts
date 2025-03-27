export const BUSINESS_HOURS = {
  OPEN: '09:00',
  CLOSE: '19:30',
  LUNCH_START: '13:00',
  LUNCH_END: '14:30'
};

export const SERVICE_PRICE_TYPES = {
  FIXED: 'fixed',
  VARIABLE: 'variable'
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TIME_SLOT_INTERVAL = 15; // minutes

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

export const BUSINESS_INFO = {
  ADDRESS: 'Quadra 5 lote 48, 48 - 71693-006 Vila São José',
  PHONE: '(61) 99999-9999',
  WORK_DAYS: 'Segunda a Sábado',
  WORK_HOURS: '9:00 - 19:30',
  LUNCH_HOURS: '13:00 - 14:30'
};

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
  LOYALTY_REWARDS: '/api/loyalty-rewards'
};
