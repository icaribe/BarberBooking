-- Script de Importação de Serviços para o Supabase
-- Cole este script no SQL Editor do Supabase e execute

-- Comando para desativar restrições temporariamente (opcional)
-- ALTER TABLE services DISABLE TRIGGER ALL;

-- Comandos INSERT para a tabela services
INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (6, 'Corte Degradê', 3500, 'fixed', 40, 1, 'Corte com técnica de degradê', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (7, 'Limpeza de Pele', 4500, 'fixed', 30, 3, 'Limpeza facial profunda', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (8, 'Relaxamento Capilar', 7000, 'variable', 60, 5, 'Tratamento para alisar os cabelos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (9, 'Pigmentação de Barba', 4000, 'fixed', 45, 2, 'Preenchimento da barba com pigmentos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (10, 'Coloração', 6000, 'variable', 60, 6, 'Coloração completa dos cabelos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (1, 'Corte Masculino', 3000, 'fixed', 30, 1, 'Corte masculino completo', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (2, 'Corte + Barba', 5000, 'fixed', 60, 1, 'Corte masculino com barba', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (3, 'Corte + Barba + Sobrancelha na Navalha', null, 'variable', 60, 1, 'Corte, barba e sobrancelha', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (4, 'Barba Tradicional', 2500, 'fixed', 30, 2, 'Serviço completo de barba com toalha quente', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (5, 'Sobrancelha na Navalha', 1000, 'fixed', 15, 4, 'Modelagem de sobrancelha com navalha', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (11, 'Corte + Barba + Sobrancelha na Pinça', null, 'variable', 60, 1, 'Serviço completo com barba e sobrancelha na pinça', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (12, 'Corte + Pigmentação', 6000, 'fixed', 60, 1, 'Corte com pigmentação capilar', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (13, 'Corte + Sobrancelha na Navalha', null, 'variable', 30, 1, 'Corte com modelagem de sobrancelha', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (14, 'Corte + Sobrancelha na Pinça', 4500, 'fixed', 60, 1, 'Corte com modelagem de sobrancelha na pinça', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (15, 'Corte 1 e 2 pente', 2000, 'fixed', 15, 1, 'Corte rápido com máquina', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (16, 'Barba + Pezinho', 3200, 'fixed', 30, 2, 'Barba completa com acabamento no pescoço', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (17, 'Acabamento (Pezinho)', 700, 'fixed', 15, 2, 'Acabamento apenas na nuca', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (18, 'Hidratação', 2000, 'fixed', 15, 3, 'Tratamento de hidratação facial', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (19, 'BOTOX', 4000, 'fixed', 30, 3, 'Tratamento rejuvenescedor para face', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (20, 'Depilação Nasal', 1000, 'fixed', 15, 3, 'Remoção dos pelos nasais', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (21, 'Sobrancelha Pinça', 1000, 'fixed', 15, 4, 'Modelagem de sobrancelha com pinça', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (22, 'Lavagem + Penteado', 2000, 'variable', 15, 5, 'Lavagem com shampoo e finalização', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (23, 'Relaxamento Capilar (Graxa)', 2000, 'fixed', 30, 5, 'Relaxamento com produto específico', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (24, 'Relaxamento Capilar + Hidratação', 3000, 'fixed', 30, 5, 'Relaxamento com tratamento hidratante', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (25, 'Pigmentação', 3000, 'variable', 15, 5, 'Aplicação de pigmentos para disfarçar falhas', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (26, 'Pintura', 3000, 'variable', 15, 5, 'Coloração para cabelos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (27, 'Progressiva', 5000, 'fixed', 30, 6, 'Tratamento para alisar os cabelos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (28, 'Selagem', 5000, 'fixed', 30, 6, 'Tratamento para selar cutículas dos fios', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (29, 'Platinado', 14000, 'variable', 30, 6, 'Descoloração total dos cabelos', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)
VALUES (30, 'Luzes', 14000, 'variable', 30, 6, 'Mechas para iluminar o cabelo', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  price_type = EXCLUDED.price_type,
  duration_minutes = EXCLUDED.duration_minutes,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Comando para reativar restrições (opcional)
-- ALTER TABLE services ENABLE TRIGGER ALL;

-- Resetar a sequência para o próximo ID (opcional)
-- SELECT setval('services_id_seq', (SELECT MAX(id) FROM services), true);
