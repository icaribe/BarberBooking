
-- Executar este script no SQL Editor do Supabase para garantir compatibilidade entre
-- as colunas loyaltyPoints (Drizzle) e loyalty_points (Supabase)

-- Verificar se a tabela users tem a coluna loyalty_points
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'loyalty_points'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE 'A coluna loyalty_points já existe na tabela users';
    ELSE
        RAISE NOTICE 'Adicionando coluna loyalty_points à tabela users';
        EXECUTE 'ALTER TABLE public.users ADD COLUMN loyalty_points INTEGER DEFAULT 0';
    END IF;
END $$;

-- Configurar a permissão RLS para a coluna loyalty_points
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
