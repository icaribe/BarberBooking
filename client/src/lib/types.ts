// Definindo interfaces para os tipos de dados utilizados no aplicativo

export type UserRole = 'USER' | 'PROFESSIONAL' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  points: number;
  loyaltyPoints: number; // Alias para points para compatibilidade
  role: UserRole;
}

export interface UserRegistration {
  username: string;
  password: string;
  email: string;
  name: string;
  phone?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  icon: string | null;
  description?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  priceType: string;
  durationMinutes: number;
  categoryId: number;
  category?: ServiceCategory;
}

export interface Professional {
  id: number;
  name: string;
  specialties: string[];
  avatar: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Schedule {
  id: number;
  professionalId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: number;
  userId: number;
  professionalId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  professional?: Professional;
  user?: User;
}

export interface AppointmentService {
  id: number;
  appointmentId: number;
  serviceId: number;
  service?: Service;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon: string | null;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl?: string;
  category?: ProductCategory;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  imageUrl?: string;
}