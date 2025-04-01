#!/bin/bash

# Script para executar a inserção de produtos no Supabase
echo "Iniciando a inserção de produtos no banco de dados Supabase..."
tsx scripts/populate-products-full.ts

echo "Script finalizado."