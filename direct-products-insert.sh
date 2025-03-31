#!/bin/bash
# Este script usa diretamente a service key que ignora as políticas RLS
# para inserir produtos na tabela products

# Executar o script TypeScript
echo "Inserindo produtos diretamente usando a service key..."
tsx scripts/direct-products-insert.ts