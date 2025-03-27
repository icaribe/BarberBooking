import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  loyaltyPoints: integer("loyalty_points").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

// Service category schema
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).pick({
  name: true,
  icon: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price"),
  priceType: text("price_type").default("fixed"), // "fixed" or "variable"
  durationMinutes: integer("duration_minutes").notNull(),
  categoryId: integer("category_id").notNull(),
  description: text("description"),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  price: true,
  priceType: true,
  durationMinutes: true,
  categoryId: true,
  description: true,
});

// Professional schema
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  specialties: text("specialties").array(),
  bio: text("bio"),
});

export const insertProfessionalSchema = createInsertSchema(professionals).pick({
  name: true,
  avatar: true,
  rating: true,
  specialties: true,
  bio: true,
});

// Schedule schema (availability)
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  professionalId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  professionalId: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  notes: true,
});

// Appointment Services (junction table for many-to-many relationship)
export const appointmentServices = pgTable("appointment_services", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull(),
  serviceId: integer("service_id").notNull(),
});

export const insertAppointmentServiceSchema = createInsertSchema(appointmentServices).pick({
  appointmentId: true,
  serviceId: true,
});

// Product category schema
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const insertProductCategorySchema = createInsertSchema(productCategories).pick({
  name: true,
  icon: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  inStock: boolean("in_stock").default(true),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  price: true,
  description: true,
  imageUrl: true,
  categoryId: true,
  inStock: true,
});

// Loyalty rewards schema
export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
});

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).pick({
  name: true,
  description: true,
  pointsCost: true,
  icon: true,
  isActive: true,
});

// Types export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type AppointmentService = typeof appointmentServices.$inferSelect;
export type InsertAppointmentService = z.infer<typeof insertAppointmentServiceSchema>;

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;
