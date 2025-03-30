
-- Script para recriar a tabela products no Supabase
-- Execução: Copie este conteúdo no SQL Editor do Supabase

-- Primeiro, vamos excluir a tabela existente se ela existir
DROP TABLE IF EXISTS public.products;

-- Agora vamos criar a tabela novamente com as colunas corretas
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id INTEGER NOT NULL REFERENCES public.product_categories(id),
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar políticas de acesso (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura por todos
CREATE POLICY "Allow public read access" ON public.products 
  FOR SELECT 
  USING (true);

-- Criar política para permitir inserção e atualização pelos autenticados
CREATE POLICY "Allow authenticated insert" ON public.products 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.products 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Verificação final
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'products' 
  AND table_schema = 'public';
