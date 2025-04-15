
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users
FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Admins podem ver todos os usuários" ON public.users
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para service_categories
CREATE POLICY "Todos podem ver categorias" ON public.service_categories
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar categorias" ON public.service_categories
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para services
CREATE POLICY "Todos podem ver serviços" ON public.services
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar serviços" ON public.services
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para professionals
CREATE POLICY "Todos podem ver profissionais" ON public.professionals
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar profissionais" ON public.professionals
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para schedules
CREATE POLICY "Todos podem ver horários" ON public.schedules
FOR SELECT USING (true);

CREATE POLICY "Admin e profissionais podem modificar horários" ON public.schedules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND (role = 'admin' OR role = 'professional')
  )
);

-- Políticas para appointments
CREATE POLICY "Ver próprios agendamentos ou todos se admin/professional" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND (
      role = 'admin' 
      OR role = 'professional' 
      OR auth_id IN (SELECT user_id FROM public.appointments WHERE id = appointments.id)
    )
  )
);

CREATE POLICY "Criar agendamentos" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Atualizar agendamentos se admin/professional" ON public.appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND (role = 'admin' OR role = 'professional')
  )
);

-- Políticas para appointment_services
CREATE POLICY "Ver serviços dos próprios agendamentos" ON public.appointment_services
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_services.appointment_id
    AND (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() 
        AND (role = 'admin' OR role = 'professional')
      )
      OR a.user_id = auth.uid()
    )
  )
);

-- Políticas para product_categories
CREATE POLICY "Todos podem ver categorias de produtos" ON public.product_categories
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar categorias de produtos" ON public.product_categories
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para products
CREATE POLICY "Todos podem ver produtos" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar produtos" ON public.products
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para loyalty_rewards
CREATE POLICY "Todos podem ver recompensas" ON public.loyalty_rewards
FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode modificar recompensas" ON public.loyalty_rewards
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- Políticas para cash_flow
CREATE POLICY "Apenas admin vê fluxo de caixa" ON public.cash_flow
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() 
    AND (role = 'admin' OR role = 'professional')
  )
);
