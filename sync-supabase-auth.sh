#!/bin/bash

# Script para executar todos os scripts de sincronização com o Supabase Auth

echo "Iniciando sincronização com Supabase Auth..."

# 1. Verificar e atualizar a estrutura da tabela users
echo "1. Atualizando a estrutura da tabela users..."
node scripts/update-users-table.js

# 2. Configurar políticas RLS para integração com Supabase Auth
echo "2. Configurando políticas RLS para integração com Supabase Auth..."
node scripts/configure-supabase-auth-rls.js

echo "Sincronização com Supabase Auth concluída!"