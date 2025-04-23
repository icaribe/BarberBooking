#!/bin/bash

# Carregar variáveis de ambiente
source .env

# Verificar conexão Supabase
echo "Verificando tabelas do Supabase..."
echo "URL: $SUPABASE_URL"
echo ""

# Verificar estrutura da tabela cash_flow
curl -X POST "$SUPABASE_URL/rest/v1/rpc/db_schema_cash_flow" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'