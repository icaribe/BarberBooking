#!/bin/bash

# Carregar variáveis de ambiente
source .env

echo "Verificando conexão com o Supabase..."
echo "SUPABASE_URL: $SUPABASE_URL"
echo ""

# Testar conexão DNS com os endpoints do Supabase
echo "=== Teste de DNS ==="
echo "Testando db.rrqefsxymripcvoabers.supabase.co..."
nslookup db.rrqefsxymripcvoabers.supabase.co

echo ""
echo "Testando rrqefsxymripcvoabers.supabase.co..."
nslookup rrqefsxymripcvoabers.supabase.co

echo ""
echo "=== Teste de API do Supabase ==="
# Testar API do Supabase
echo "Tentando buscar usuários via API REST..."
curl -s "$SUPABASE_URL/rest/v1/users?select=id,email&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq

echo ""
echo "=== Teste de Tabela Cash Flow ==="
echo "Testando acesso à tabela cash_flow..."
curl -s "$SUPABASE_URL/rest/v1/cash_flow?select=*&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | jq

echo ""
echo "=== Fim dos testes ==="