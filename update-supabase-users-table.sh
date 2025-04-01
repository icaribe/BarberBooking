#!/bin/bash

# Configurações
if [ -f ".env" ]; then
  source .env
fi

# Verificar se DATABASE_URL está definido
if [ -z "$DATABASE_URL" ]; then
  echo "Erro: DATABASE_URL não está definido. Configure a variável de ambiente."
  exit 1
fi

# Comando SQL para adicionar as colunas auth_id e password
SQL="
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN auth_id UUID;
        RAISE NOTICE 'Coluna auth_id adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna auth_id já existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE public.users ADD COLUMN password VARCHAR NOT NULL DEFAULT '';
        RAISE NOTICE 'Coluna password adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna password já existe.';
    END IF;
END \$\$;
"

echo "Executando alterações na tabela de usuários..."
echo "$SQL" | psql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ Atualização concluída com sucesso!"
else
  echo "❌ Erro ao executar o SQL. Verifique a conexão com o banco de dados."
  exit 1
fi

echo "As colunas auth_id e password foram adicionadas à tabela de usuários."