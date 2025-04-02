// Função auxiliar para formatar moeda em BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100); // Converte de centavos para reais
};

// Chaves de armazenamento para localStorage/sessionStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'los-barbeiros-auth-token',
  USER_DATA: 'los-barbeiros-user-data',
  CART: 'los-barbeiros-cart',
  THEME: 'los-barbeiros-theme'
};

// Rotas da API
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Usuários
  USER_PROFILE: '/api/users/profile',
  USER_UPDATE: '/api/users/update',
  
  // Serviços
  SERVICES: '/api/services',
  SERVICE_CATEGORIES: '/api/service-categories',
  
  // Produtos
  PRODUCTS: '/api/products',
  PRODUCT_CATEGORIES: '/api/product-categories',
  
  // Agendamentos
  APPOINTMENTS: '/api/appointments',
  APPOINTMENT_BY_ID: (id: string) => `/api/appointments/${id}`,
  
  // Profissionais
  PROFESSIONALS: '/api/professionals'
};

// Formatos de data
export const DATE_FORMATS = {
  DEFAULT: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm'
};

// Status dos agendamentos
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Mapeamento de status para exibição
export const APPOINTMENT_STATUS = {
  [AppointmentStatus.SCHEDULED]: {
    label: 'Agendado',
    color: 'bg-yellow-500'
  },
  [AppointmentStatus.COMPLETED]: {
    label: 'Concluído',
    color: 'bg-green-500'
  },
  [AppointmentStatus.CANCELLED]: {
    label: 'Cancelado',
    color: 'bg-red-500'
  }
};

// Horário de funcionamento da barbearia
export const BUSINESS_HOURS = {
  start: 9, // 9:00
  end: 19,  // 19:00
  interval: 30, // intervalo de 30 minutos entre agendamentos
  
  daysOfWeek: {
    0: { open: true, startHour: 9, endHour: 13 }, // Domingo: 9-13
    1: { open: true, startHour: 9, endHour: 19 }, // Segunda: 9-19
    2: { open: true, startHour: 9, endHour: 19 }, // Terça: 9-19
    3: { open: true, startHour: 9, endHour: 19 }, // Quarta: 9-19
    4: { open: true, startHour: 9, endHour: 19 }, // Quinta: 9-19
    5: { open: true, startHour: 9, endHour: 19 }, // Sexta: 9-19
    6: { open: true, startHour: 9, endHour: 17 }  // Sábado: 9-17
  }
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet e tente novamente.',
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha inválidos.',
    SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
    WEAK_PASSWORD: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.',
    EXISTING_EMAIL: 'Este email já está em uso.',
    EMPTY_FIELDS: 'Preencha todos os campos obrigatórios.'
  },
  FORM: {
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    INVALID_EMAIL: 'Insira um email válido.',
    INVALID_PHONE: 'Insira um número de telefone válido.',
    PASSWORD_MISMATCH: 'As senhas não coincidem.'
  },
  APPOINTMENT: {
    UNAVAILABLE_TIME: 'Este horário não está disponível.',
    PAST_DATE: 'Não é possível agendar para datas passadas.',
    OUTSIDE_BUSINESS_HOURS: 'Este horário está fora do expediente.',
    MINIMUM_NOTICE: 'Agendamentos devem ser feitos com pelo menos 1 hora de antecedência.'
  }
};