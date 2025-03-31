Configurando políticas de Row Level Security (RLS) no Supabase...
NOTA: Este script só irá simular a execução dos comandos SQL.
      As políticas devem ser configuradas manualmente no Supabase.
SQL: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
SQL: ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
SQL: DROP POLICY IF EXISTS users_select_policy ON public.users;
SQL: DROP POLICY IF EXISTS users_insert_policy ON public.users;
SQL: DROP POLICY IF EXISTS users_update_policy ON public.users;
SQL: DROP POLICY IF EXISTS users_delete_policy ON public.users;
SQL: 
      CREATE POLICY users_select_policy ON public.users
        FOR SELECT USING (auth.uid()::text = id::text OR auth.uid() IS NULL);
    
SQL: 
      CREATE POLICY users_insert_policy ON public.users
        FOR INSERT WITH CHECK (true);
    
SQL: 
      CREATE POLICY users_update_policy ON public.users
        FOR UPDATE USING (auth.uid()::text = id::text)
        WITH CHECK (auth.uid()::text = id::text);
    
SQL: 
      CREATE POLICY users_delete_policy ON public.users
        FOR DELETE USING (false);
    
  ✓ Políticas para a tabela users configuradas
SQL: 
      DROP POLICY IF EXISTS service_categories_select_policy ON public.service_categories;
      CREATE POLICY service_categories_select_policy ON public.service_categories
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS service_categories_insert_policy ON public.service_categories;
      CREATE POLICY service_categories_insert_policy ON public.service_categories
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS service_categories_update_policy ON public.service_categories;
      CREATE POLICY service_categories_update_policy ON public.service_categories
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS service_categories_delete_policy ON public.service_categories;
      CREATE POLICY service_categories_delete_policy ON public.service_categories
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela service_categories configuradas
SQL: 
      DROP POLICY IF EXISTS services_select_policy ON public.services;
      CREATE POLICY services_select_policy ON public.services
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS services_insert_policy ON public.services;
      CREATE POLICY services_insert_policy ON public.services
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS services_update_policy ON public.services;
      CREATE POLICY services_update_policy ON public.services
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS services_delete_policy ON public.services;
      CREATE POLICY services_delete_policy ON public.services
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela services configuradas
SQL: 
      DROP POLICY IF EXISTS professionals_select_policy ON public.professionals;
      CREATE POLICY professionals_select_policy ON public.professionals
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS professionals_insert_policy ON public.professionals;
      CREATE POLICY professionals_insert_policy ON public.professionals
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS professionals_update_policy ON public.professionals;
      CREATE POLICY professionals_update_policy ON public.professionals
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS professionals_delete_policy ON public.professionals;
      CREATE POLICY professionals_delete_policy ON public.professionals
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela professionals configuradas
SQL: 
      DROP POLICY IF EXISTS schedules_select_policy ON public.schedules;
      CREATE POLICY schedules_select_policy ON public.schedules
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS schedules_insert_policy ON public.schedules;
      CREATE POLICY schedules_insert_policy ON public.schedules
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS schedules_update_policy ON public.schedules;
      CREATE POLICY schedules_update_policy ON public.schedules
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS schedules_delete_policy ON public.schedules;
      CREATE POLICY schedules_delete_policy ON public.schedules
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela schedules configuradas
SQL: 
      DROP POLICY IF EXISTS appointments_select_policy ON public.appointments;
      CREATE POLICY appointments_select_policy ON public.appointments
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS appointments_insert_policy ON public.appointments;
      CREATE POLICY appointments_insert_policy ON public.appointments
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS appointments_update_policy ON public.appointments;
      CREATE POLICY appointments_update_policy ON public.appointments
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS appointments_delete_policy ON public.appointments;
      CREATE POLICY appointments_delete_policy ON public.appointments
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela appointments configuradas
SQL: 
      DROP POLICY IF EXISTS appointment_services_select_policy ON public.appointment_services;
      CREATE POLICY appointment_services_select_policy ON public.appointment_services
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS appointment_services_insert_policy ON public.appointment_services;
      CREATE POLICY appointment_services_insert_policy ON public.appointment_services
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS appointment_services_update_policy ON public.appointment_services;
      CREATE POLICY appointment_services_update_policy ON public.appointment_services
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS appointment_services_delete_policy ON public.appointment_services;
      CREATE POLICY appointment_services_delete_policy ON public.appointment_services
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela appointment_services configuradas
SQL: 
      DROP POLICY IF EXISTS product_categories_select_policy ON public.product_categories;
      CREATE POLICY product_categories_select_policy ON public.product_categories
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS product_categories_insert_policy ON public.product_categories;
      CREATE POLICY product_categories_insert_policy ON public.product_categories
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS product_categories_update_policy ON public.product_categories;
      CREATE POLICY product_categories_update_policy ON public.product_categories
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS product_categories_delete_policy ON public.product_categories;
      CREATE POLICY product_categories_delete_policy ON public.product_categories
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela product_categories configuradas
SQL: 
      DROP POLICY IF EXISTS products_select_policy ON public.products;
      CREATE POLICY products_select_policy ON public.products
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS products_insert_policy ON public.products;
      CREATE POLICY products_insert_policy ON public.products
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS products_update_policy ON public.products;
      CREATE POLICY products_update_policy ON public.products
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS products_delete_policy ON public.products;
      CREATE POLICY products_delete_policy ON public.products
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela products configuradas
SQL: 
      DROP POLICY IF EXISTS loyalty_rewards_select_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_select_policy ON public.loyalty_rewards
        FOR SELECT USING (true);
    
SQL: 
      DROP POLICY IF EXISTS loyalty_rewards_insert_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_insert_policy ON public.loyalty_rewards
        FOR INSERT WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS loyalty_rewards_update_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_update_policy ON public.loyalty_rewards
        FOR UPDATE USING (true)
        WITH CHECK (true);
    
SQL: 
      DROP POLICY IF EXISTS loyalty_rewards_delete_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_delete_policy ON public.loyalty_rewards
        FOR DELETE USING (true);
    
  ✓ Políticas para a tabela loyalty_rewards configuradas

✅ Configuração de RLS concluída com sucesso!
