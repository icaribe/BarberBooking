import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, pgEnum, varchar, uuid, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enum para roles de usuário
export const userRoleEnum = pgEnum('user_role', ['admin', 'professional', 'customer']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  auth_id: uuid("auth_id").unique(),
  username: varchar("username").notNull(),
  password: varchar("password").notNull(),
  name: varchar("name"),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  role: userRoleEnum("role").default("customer"),
  professionalId: integer("professional_id"),
  loyaltyPoints: integer("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  professionalId: true,
});

// Estendendo o schema para incluir validações adicionais
export const userValidationSchema = insertUserSchema.extend({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  username: z.string().min(3, "O nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
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
  pointsRequired: integer("points_required").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
});

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).pick({
  name: true,
  description: true,
  pointsRequired: true,
  icon: true,
  isActive: true,
});

// Esquema para histórico de pontos de fidelidade
export const loyaltyHistory = pgTable("loyalty_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoyaltyHistorySchema = createInsertSchema(loyaltyHistory).pick({
  userId: true,
  points: true,
  description: true,
  date: true,
});

// Enum para tipo de transação
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

// Enum para categorias de transação
export const transactionCategoryEnum = pgEnum('transaction_category', [
  'service', 'product', 'commission', 'salary', 'rent', 'utilities', 'supplies', 'marketing', 'other'
]);

// Tabela para fluxo de caixa
export const cashFlow = pgTable("cash_flow", {
  id: serial("id").primaryKey(),
  type: transactionTypeEnum("type").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  appointmentId: integer("appointment_id"),
  productId: integer("product_id"),
  professionalId: integer("professional_id"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCashFlowSchema = createInsertSchema(cashFlow).pick({
  type: true,
  category: true,
  amount: true,
  description: true,
  date: true,
  appointmentId: true,
  productId: true,
  professionalId: true,
  createdById: true,
});

// Tabela para vincular profissionais e serviços
export const professionalServices = pgTable("professional_services", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  serviceId: integer("service_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfessionalServiceSchema = createInsertSchema(professionalServices).pick({
  professionalId: true,
  serviceId: true,
});

// Relações entre tabelas
export const usersRelations = relations(users, ({ many, one }) => ({
  appointments: many(appointments),
  createdTransactions: many(cashFlow, { relationName: "createdBy" }),
  professional: one(professionals, {
    fields: [users.professionalId],
    references: [professionals.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  appointmentServices: many(appointmentServices),
}));

export const professionalsRelations = relations(professionals, ({ many, one }) => ({
  schedules: many(schedules),
  appointments: many(appointments),
  users: many(users, { relationName: "professionalUser" }),
  professionalServices: many(professionalServices),
  transactions: many(cashFlow),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  professional: one(professionals, {
    fields: [schedules.professionalId],
    references: [professionals.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id],
  }),
  appointmentServices: many(appointmentServices),
}));

export const appointmentServicesRelations = relations(appointmentServices, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentServices.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, {
    fields: [appointmentServices.serviceId],
    references: [services.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  transactions: many(cashFlow),
}));

export const cashFlowRelations = relations(cashFlow, ({ one }) => ({
  appointment: one(appointments, {
    fields: [cashFlow.appointmentId],
    references: [appointments.id],
  }),
  product: one(products, {
    fields: [cashFlow.productId],
    references: [products.id],
  }),
  professional: one(professionals, {
    fields: [cashFlow.professionalId],
    references: [professionals.id],
  }),
  createdBy: one(users, {
    fields: [cashFlow.createdById],
    references: [users.id],
  }),
}));

export const professionalServicesRelations = relations(professionalServices, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalServices.professionalId],
    references: [professionals.id],
  }),
  service: one(services, {
    fields: [professionalServices.serviceId],
    references: [services.id],
  }),
}));

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

export type CashFlow = typeof cashFlow.$inferSelect;
export type InsertCashFlow = z.infer<typeof insertCashFlowSchema>;

export type ProfessionalService = typeof professionalServices.$inferSelect;
export type InsertProfessionalService = z.infer<typeof insertProfessionalServiceSchema>;