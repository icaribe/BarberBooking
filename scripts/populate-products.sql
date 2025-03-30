
-- Script SQL para popular a tabela products no Supabase
-- Versão pura SQL sem dependência de TypeScript

-- Primeiro, adicionar a restrição de unicidade se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_name_key' 
    AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
    RAISE NOTICE 'Restrição de unicidade adicionada para a coluna name';
  ELSE
    RAISE NOTICE 'A restrição de unicidade já existe para a coluna name';
  END IF;
END
$$;

-- Inserir produtos da categoria 1 (Barba e Cabelo)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('Foxidil minoxidil para barba (fox) 120 ml', 9000, 'Minoxidil para crescimento da barba', NULL, 1, TRUE, NOW(), NOW()),
  ('Bal fox', 4000, 'Bálsamo para barba da Fox', NULL, 1, TRUE, NOW(), NOW()),
  ('Balm B.URB para barba', 3500, 'Bálsamo para barba da marca B.URB', NULL, 1, TRUE, NOW(), NOW()),
  ('Balm Red Nek para barba', 3500, 'Bálsamo para barba da marca Red Nek', NULL, 1, TRUE, NOW(), NOW()),
  ('Derma Roller', 4000, 'Equipamento para microagulhamento capilar', NULL, 1, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('Condicionador 3 em 1', 3000, 'Condicionador multifuncional 3 em 1', NULL, 1, TRUE, NOW(), NOW()),
  ('Condicionador Ice Fresh Fox 240ml', 2500, 'Condicionador refrescante', NULL, 1, TRUE, NOW(), NOW()),
  ('Escova anti estática', 4500, 'Escova especial anti estática', NULL, 1, TRUE, NOW(), NOW()),
  ('Esponja de Nudred', 3000, 'Esponja para cabelo crespo', NULL, 1, TRUE, NOW(), NOW()),
  ('Loção Hidratante Balm Barba 4 em 1', 3500, 'Loção multifuncional para barba', NULL, 1, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Inserir produtos da categoria 2 (Pomadas)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('Cera Red Neck Cinza', 2000, 'Cera de fixação média, acabamento matte', NULL, 2, TRUE, NOW(), NOW()),
  ('Cera Red Neck Laranja', 2000, 'Cera de fixação forte, acabamento brilhante', NULL, 2, TRUE, NOW(), NOW()),
  ('Cera Red Neck Roxa', 2000, 'Cera de fixação forte, acabamento matte', NULL, 2, TRUE, NOW(), NOW()),
  ('Cera Red Neck Verde', 2000, 'Cera de fixação média, acabamento brilhante', NULL, 2, TRUE, NOW(), NOW()),
  ('Cera Red Neck Vermelho', 2000, 'Cera de fixação extra forte, acabamento matte', NULL, 2, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Inserir produtos da categoria 3 (Bebidas Alcoólicas)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('BUDWEISER LONG NECK', 700, 'Cerveja Budweiser Long Neck', NULL, 3, TRUE, NOW(), NOW()),
  ('Campari', 600, 'Dose de Campari', NULL, 3, TRUE, NOW(), NOW()),
  ('CORONA LONG NECK', 800, 'Cerveja Corona Long Neck', NULL, 3, TRUE, NOW(), NOW()),
  ('Coronita', 700, 'Cerveja Coronita', NULL, 3, TRUE, NOW(), NOW()),
  ('DOSE ALAMBIQUE MURICI', 200, 'Dose de cachaça artesanal', NULL, 3, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Inserir produtos da categoria 4 (Bebidas Não Alcoólicas)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('AGUA COM GAS', 350, 'Água mineral com gás', NULL, 4, TRUE, NOW(), NOW()),
  ('Agua com gas + Limão', 350, 'Água mineral com gás e limão', NULL, 4, TRUE, NOW(), NOW()),
  ('AGUA MINERAL', 300, 'Água mineral sem gás', NULL, 4, TRUE, NOW(), NOW()),
  ('Antarctica Lata', 350, 'Refrigerante Antarctica em lata', NULL, 4, TRUE, NOW(), NOW()),
  ('COCA 310ML', 450, 'Coca-Cola lata 310ml', NULL, 4, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Inserir produtos da categoria 5 (Lanches)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('Barra de Cereal', 250, 'Barra de cereal diversos sabores', NULL, 5, TRUE, NOW(), NOW()),
  ('Barra de cereal banana', 300, 'Barra de cereal sabor banana', NULL, 5, TRUE, NOW(), NOW()),
  ('Barra de cereal coco + frutas', 300, 'Barra de cereal sabor coco com frutas', NULL, 5, TRUE, NOW(), NOW()),
  ('Chocolate 5 Star 40g', 400, 'Chocolate 5 Star 40g', NULL, 5, TRUE, NOW(), NOW()),
  ('Chocolate branco Laka 34g', 400, 'Chocolate branco Lacta 34g', NULL, 5, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Inserir produtos da categoria 6 (Acessórios)
INSERT INTO products (name, price, description, image_url, category_id, in_stock, created_at, updated_at)
VALUES
  ('CARTEIRA PAIOL OURO', 1800, 'Carteira de paiol ouro', NULL, 6, TRUE, NOW(), NOW()),
  ('CARTEIRA TRADICIONAL E MAMA CADELA', 1500, 'Carteira tradicional e mama cadela', NULL, 6, TRUE, NOW(), NOW()),
  ('Tabaco', 200, 'Tabaco para enrolar', NULL, 6, TRUE, NOW(), NOW()),
  ('UND PAIOL OURO', 150, 'Unidade de paiol ouro', NULL, 6, TRUE, NOW(), NOW()),
  ('UND PAIOL TRADICIONAL E MAMA CADELA', 100, 'Unidade de paiol tradicional e mama cadela', NULL, 6, TRUE, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verificar a contagem de produtos inseridos
SELECT COUNT(*) as total_produtos FROM products;
