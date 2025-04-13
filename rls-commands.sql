-- Script para configuração de políticas RLS no Supabase
-- Execute este script no SQL Editor do painel de administração do Supabase

-- 1. Ativar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (caso queira reiniciar)
-- Tabela users
DROP POLICY IF EXISTS "Allow users to read their own data" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow admins to read all user data" ON users;
DROP POLICY IF EXISTS "Allow anon to read non-sensitive user data" ON users;

-- Tabela services
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
DROP POLICY IF EXISTS "Allow admins and professionals to manage services" ON services;

-- Tabela service_categories
DROP POLICY IF EXISTS "Allow public read access to service categories" ON service_categories;
DROP POLICY IF EXISTS "Allow admins to manage service categories" ON service_categories;

-- Tabela products
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow admins to manage products" ON products;

-- Tabela product_categories
DROP POLICY IF EXISTS "Allow public read access to product categories" ON product_categories;
DROP POLICY IF EXISTS "Allow admins to manage product categories" ON product_categories;

-- Tabela professionals
DROP POLICY IF EXISTS "Allow public read access to professionals" ON professionals;
DROP POLICY IF EXISTS "Allow admins to manage professionals" ON professionals;

-- Tabela schedules
DROP POLICY IF EXISTS "Allow public read access to schedules" ON schedules;
DROP POLICY IF EXISTS "Allow professionals to manage their schedules" ON schedules;
DROP POLICY IF EXISTS "Allow admins to manage all schedules" ON schedules;

-- Tabela appointments
DROP POLICY IF EXISTS "Allow users to read their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow users to create appointments" ON appointments;
DROP POLICY IF EXISTS "Allow users to update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow admins to manage all appointments" ON appointments;

-- Tabela appointment_services
DROP POLICY IF EXISTS "Allow users to read their appointment services" ON appointment_services;
DROP POLICY IF EXISTS "Allow users to create appointment services" ON appointment_services;
DROP POLICY IF EXISTS "Allow admins to manage all appointment services" ON appointment_services;

-- Tabela loyalty_rewards
DROP POLICY IF EXISTS "Allow public read access to loyalty rewards" ON loyalty_rewards;
DROP POLICY IF EXISTS "Allow admins to manage loyalty rewards" ON loyalty_rewards;

-- Tabela loyalty_history
DROP POLICY IF EXISTS "Allow users to read their own loyalty history" ON loyalty_history;
DROP POLICY IF EXISTS "Allow users to create loyalty history entries" ON loyalty_history;
DROP POLICY IF EXISTS "Allow admins to manage all loyalty history" ON loyalty_history;

-- Tabela cash_flow
DROP POLICY IF EXISTS "Allow admins to manage cash flow" ON cash_flow;
DROP POLICY IF EXISTS "Allow professionals to read cash flow entries related to their appointments" ON cash_flow;

-- 3. Criar políticas para cada tabela
-- Tabela users
CREATE POLICY "Allow users to read their own data" 
ON users
FOR SELECT
USING (auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow users to update their own data" 
ON users
FOR UPDATE
USING (auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow admins to read all user data" 
ON users
FOR SELECT
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow anon to read non-sensitive user data" 
ON users
FOR SELECT
USING (role = 'professional');

-- Tabela services
CREATE POLICY "Allow public read access to services" 
ON services
FOR SELECT
USING (true);

CREATE POLICY "Allow admins and professionals to manage services" 
ON services
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role IN ('admin', 'professional')));

-- Tabela service_categories
CREATE POLICY "Allow public read access to service categories" 
ON service_categories
FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage service categories" 
ON service_categories
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela products
CREATE POLICY "Allow public read access to products" 
ON products
FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage products" 
ON products
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela product_categories
CREATE POLICY "Allow public read access to product categories" 
ON product_categories
FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage product categories" 
ON product_categories
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela professionals
CREATE POLICY "Allow public read access to professionals" 
ON professionals
FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage professionals" 
ON professionals
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela schedules
CREATE POLICY "Allow public read access to schedules" 
ON schedules
FOR SELECT
USING (true);

CREATE POLICY "Allow professionals to manage their schedules" 
ON schedules
FOR ALL
USING (auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela appointments
CREATE POLICY "Allow users to read their own appointments" 
ON appointments
FOR SELECT
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow users to create appointments" 
ON appointments
FOR INSERT
USING (auth.uid() IN (SELECT auth_id FROM users));

CREATE POLICY "Allow users to update their own appointments" 
ON appointments
FOR UPDATE
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela appointment_services
CREATE POLICY "Allow users to read their appointment services" 
ON appointment_services
FOR SELECT
USING (auth.uid() IN (SELECT u.auth_id FROM users u JOIN appointments a ON u.id = a.user_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id JOIN appointments a ON p.id = a.professional_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow users to create appointment services" 
ON appointment_services
FOR INSERT
USING (auth.uid() IN (SELECT u.auth_id FROM users u JOIN appointments a ON u.id = a.user_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela loyalty_rewards
CREATE POLICY "Allow public read access to loyalty rewards" 
ON loyalty_rewards
FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage loyalty rewards" 
ON loyalty_rewards
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela loyalty_history
CREATE POLICY "Allow users to read their own loyalty history" 
ON loyalty_history
FOR SELECT
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow users to create loyalty history entries" 
ON loyalty_history
FOR INSERT
USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

-- Tabela cash_flow
CREATE POLICY "Allow admins to manage cash flow" 
ON cash_flow
FOR ALL
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));

CREATE POLICY "Allow professionals to read cash flow entries related to their appointments" 
ON cash_flow
FOR SELECT
USING (appointment_id IS NOT NULL AND auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id JOIN appointments a ON p.id = a.professional_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin'));