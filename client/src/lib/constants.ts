// Formatadores
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

// Chaves de armazenamento
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART: 'cart',
  PREFERENCES: 'preferences',
};

// URLs da API
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  // Serviços
  SERVICES: {
    BASE: '/api/services',
    CATEGORIES: '/api/service-categories',
  },
  // Agendamentos
  APPOINTMENTS: {
    BASE: '/api/appointments',
    APPOINTMENT_SERVICES: '/api/appointment-services',
  },
  // Produtos
  PRODUCTS: {
    BASE: '/api/products',
    CATEGORIES: '/api/product-categories',
  },
  // Profissionais
  PROFESSIONALS: {
    BASE: '/api/professionals',
  },
  // Usuários
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
  },
};

// Configurações de datas
export const DATE_FORMATS = {
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
  API_DATE: 'yyyy-MM-dd',
  API_TIME: 'HH:mm:ss',
  API_DATETIME: 'yyyy-MM-dd\'T\'HH:mm:ss',
};

// Status dos Agendamentos
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Mensagens de erro
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  AUTH: {
    INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
  },
  FORM: {
    REQUIRED: 'Este campo é obrigatório.',
    INVALID_EMAIL: 'Por favor, insira um e-mail válido.',
    INVALID_PHONE: 'Por favor, insira um telefone válido.',
    PASSWORD_MISMATCH: 'As senhas não coincidem.',
    PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 6 caracteres.',
  },
};