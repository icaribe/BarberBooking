#!/bin/bash
# Script para desabilitar temporariamente o RLS no Supabase

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias"
  exit 1
fi

echo "🔄 Desabilitando Row Level Security (RLS) para a tabela 'users'..."
echo "⚠️ ATENÇÃO: Use este script apenas para ambiente de desenvolvimento!"

# Executar o comando SQL para desabilitar RLS
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"ALTER TABLE users DISABLE ROW LEVEL SECURITY;\"}")

# Verificar resposta
if [[ $RESPONSE == *"error"* ]]; then
  echo "❌ Erro ao desabilitar RLS: $RESPONSE"
  exit 1
else
  echo "✅ RLS desabilitado com sucesso para a tabela 'users'!"
fi

echo ""
echo "Para reativar o RLS quando terminar os testes, execute:"
echo "curl -X POST \"$SUPABASE_URL/rest/v1/rpc/exec_sql\" \\"
echo "  -H \"apikey: $SUPABASE_SERVICE_KEY\" \\"
echo "  -H \"Authorization: Bearer $SUPABASE_SERVICE_KEY\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"sql\": \"ALTER TABLE users ENABLE ROW LEVEL SECURITY;\"}'"