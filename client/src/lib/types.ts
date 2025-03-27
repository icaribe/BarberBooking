// User related types
export interface User {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
}

export interface UserRegistration {
  username: string;
  password: string;
  name?: string;
  email?: string;
  phone?: string;
}

// Service related types
export interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
}

export interface Service {
  id: number;
  name: string;
  price: number | null;
  priceType: string; // "fixed" or "variable"
  durationMinutes: number;
  categoryId: number;
  description: string | null;
}

// Professional related types
export interface Professional {
  id: number;
  name: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  specialties: string[];
  bio: string | null;
}

export interface Schedule {
  id: number;
  professionalId: number;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

// Appointment related types
export interface Appointment {
  id: number;
  userId: number;
  professionalId: number;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: string; // scheduled, completed, cancelled
  notes: string | null;
  createdAt: Date;
}

export interface AppointmentCreation {
  userId: number;
  professionalId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  services?: number[];
}

export interface AppointmentService {
  id: number;
  appointmentId: number;
  serviceId: number;
}

// Product related types
export interface ProductCategory {
  id: number;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  inStock: boolean;
}

// Loyalty related types
export interface LoyaltyReward {
  id: number;
  name: string;
  description: string | null;
  pointsCost: number;
  icon: string | null;
  isActive: boolean;
}

// Time slot type for appointment booking
export interface TimeSlot {
  time: string;
  available: boolean;
}
