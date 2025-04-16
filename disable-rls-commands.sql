-- Script para desabilitar temporariamente Row Level Security (RLS) para testes
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento!

-- Desativar RLS na tabela de usuários
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Confirmar que RLS está desativado
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';
-- relrowsecurity = false significa que RLS está desativado

-- OPCIONAL: Para reativar o RLS quando terminar os testes
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;