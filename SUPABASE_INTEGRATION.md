# Integração Supabase - Documentação

Este documento descreve a integração do projeto com Supabase e os procedimentos para resolver problemas comuns.

## Configuração Inicial

### Variáveis de Ambiente
Certifique-se de que as seguintes variáveis de ambiente estejam configuradas:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service
USE_SUPABASE=TRUE
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

## Políticas de Segurança (RLS)

Por padrão, o Supabase utiliza Row Level Security (RLS) para proteger suas tabelas. Isso pode causar erros como:

```
new row violates row-level security policy for table "users"
```

### Opção 1: Aplicar Políticas RLS Adequadas (Recomendado)

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Primeiro, garantir que RLS esteja ativado na tabela
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON users;
DROP POLICY IF EXISTS "Admins podem ver todos os dados" ON users;
DROP POLICY IF EXISTS "Admins podem inserir dados" ON users;
DROP POLICY IF EXISTS "Admins podem atualizar dados" ON users;
DROP POLICY IF EXISTS "Admins podem deletar dados" ON users;
DROP POLICY IF EXISTS "Service role pode fazer tudo" ON users;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON users;

-- Política para permitir que qualquer usuário autenticado INSIRA novos usuários (necessário para registro)
CREATE POLICY "Permitir inserção de novos usuários" ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir que usuários VEJAM seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Política para permitir que usuários ATUALIZEM seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Políticas para administradores terem acesso total
CREATE POLICY "Admins podem ver todos os dados" ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem inserir dados" ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar dados" ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem deletar dados" ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

-- Política para permitir que a role de serviço tenha acesso completo
CREATE POLICY "Service role pode fazer tudo" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### Opção 2: Desabilitar RLS Temporariamente (Apenas para ambiente de desenvolvimento)

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Desativar RLS na tabela de usuários
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## Funções RPC (Remote Procedure Calls)

Para casos onde precisamos contornar limitações de RLS, podemos criar funções RPC no Supabase:

```sql
CREATE OR REPLACE FUNCTION create_user_direct(
  username TEXT,
  email TEXT,
  role TEXT,
  password_hash TEXT,
  name TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  auth_id UUID DEFAULT NULL
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_user_id INTEGER;
  result JSONB;
BEGIN
  -- Inserir o usuário na tabela users
  INSERT INTO users (username, email, name, phone, password, role, auth_id)
  VALUES (username, email, name, phone, password_hash, role::user_role, auth_id)
  RETURNING id INTO new_user_id;
  
  -- Buscar o usuário criado
  SELECT jsonb_build_object(
    'id', u.id,
    'username', u.username,
    'email', u.email,
    'role', u.role,
    'created_at', u.created_at
  ) INTO result
  FROM users u
  WHERE u.id = new_user_id;
  
  RETURN result;
END;
$$;
```

## Estrutura de Tabelas

A tabela principal de usuários deve ter a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  auth_id UUID UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Certifique-se de que o tipo `user_role` esteja definido:

```sql
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
```

## Solução de Problemas

### Erro "missing Twilio account SID"

Este erro ocorre quando tentamos atualizar o número de telefone no Auth do Supabase. Uma solução é armazenar o telefone apenas na tabela personalizada de usuários, sem tentar atualizar os metadados do telefone no Auth do Supabase.

### Erro "new row violates row-level security policy for table"

1. Verifique se as políticas RLS estão configuradas corretamente
2. Use o cliente admin do Supabase que ignora RLS para operações administrativas
3. Em último caso, desative o RLS temporariamente (apenas em desenvolvimento)

### Erro "user not found" ao excluir usuário

Este erro pode ocorrer quando tentamos excluir um usuário que já foi removido. Certifique-se de verificar se o usuário existe antes de tentar excluí-lo.