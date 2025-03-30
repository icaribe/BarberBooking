
-- Script para corrigir a tabela products no Supabase
-- Adiciona uma restrição de unicidade para a coluna "name"

-- Primeiro, verifica se a restrição já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_name_key' 
    AND conrelid = 'products'::regclass
  ) THEN
    -- Adiciona a restrição de unicidade para a coluna name
    ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
    RAISE NOTICE 'Restrição de unicidade adicionada para a coluna name';
  ELSE
    RAISE NOTICE 'A restrição de unicidade já existe para a coluna name';
  END IF;
END
$$;

-- Verifica também se há índices para melhorar a performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_products_category_id' 
    AND tablename = 'products'
  ) THEN
    -- Cria um índice para a coluna category_id
    CREATE INDEX idx_products_category_id ON products (category_id);
    RAISE NOTICE 'Índice criado para category_id';
  ELSE
    RAISE NOTICE 'Índice já existe para category_id';
  END IF;
END
$$;

-- Opcional: Limpar todos os dados da tabela products
-- Descomente as linhas abaixo se quiser limpar a tabela antes de inserir novos dados
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;
-- RAISE NOTICE 'Tabela products foi limpa';

SELECT 'Script executado com sucesso! Agora você pode rodar o script populate-products-corrected.ts' as message;
