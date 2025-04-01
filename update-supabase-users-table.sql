-- Script para adicionar as colunas auth_id e password à tabela de usuários no Supabase

-- Verificar se a coluna auth_id já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'auth_id'
    ) THEN
        -- Adicionar coluna auth_id se não existir
        ALTER TABLE public.users ADD COLUMN auth_id UUID;
        RAISE NOTICE 'Coluna auth_id adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna auth_id já existe.';
    END IF;

    -- Verificar se a coluna password já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
    ) THEN
        -- Adicionar coluna password se não existir
        ALTER TABLE public.users ADD COLUMN password VARCHAR NOT NULL DEFAULT '';
        RAISE NOTICE 'Coluna password adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna password já existe.';
    END IF;
END $$;