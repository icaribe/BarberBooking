-- Habilitar RLS para todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Allow users to read their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = auth_id::text);

CREATE POLICY "Allow users to update their own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = auth_id::text);

CREATE POLICY "Allow admins to read all user data" ON public.users
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para services
CREATE POLICY "Allow public read access to services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage services" ON public.services
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para service_categories
CREATE POLICY "Allow public read access to service categories" ON public.service_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage service categories" ON public.service_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para products
CREATE POLICY "Allow public read access to products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage products" ON public.products
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para product_categories
CREATE POLICY "Allow public read access to product categories" ON public.product_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage product categories" ON public.product_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para professionals
CREATE POLICY "Allow public read access to professionals" ON public.professionals
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage professionals" ON public.professionals
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para schedules
CREATE POLICY "Allow public read access to schedules" ON public.schedules
  FOR SELECT USING (true);

CREATE POLICY "Allow professionals to manage their schedules" ON public.schedules
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid()::text 
    AND role = 'professional'
    AND professionals.id = professional_id
  ));

-- Políticas para appointments
CREATE POLICY "Allow users to read their own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT auth_id::text FROM public.users WHERE id = user_id
    )
  );

CREATE POLICY "Allow professionals to read their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid()::text 
      AND role = 'professional'
      AND professionals.id = professional_id
    )
  );

CREATE POLICY "Allow users to create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT auth_id::text FROM public.users WHERE id = user_id
    )
  );

-- Políticas para appointment_services
CREATE POLICY "Allow users to read their appointment services" ON public.appointment_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.id = appointment_id
      AND u.auth_id = auth.uid()::text
    )
  );

-- Políticas para loyalty_rewards
CREATE POLICY "Allow public read access to loyalty rewards" ON public.loyalty_rewards
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage loyalty rewards" ON public.loyalty_rewards
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));

-- Políticas para loyalty_history
CREATE POLICY "Allow users to read their own loyalty history" ON public.loyalty_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid()::text 
      AND id = user_id
    )
  );

-- Políticas para cash_flow
CREATE POLICY "Allow admins to manage cash flow" ON public.cash_flow
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid()::text AND role = 'admin'
  ));