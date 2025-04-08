# Integração com Supabase

Este documento descreve como configurar e usar a integração com o Supabase para o projeto Los Barbeiros CBS.

## Requisitos Prévios

Certifique-se de que as seguintes variáveis de ambiente estão configuradas no arquivo `.env`:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-de-serviço
SUPABASE_ANON_KEY=sua-chave-anônima
DATABASE_URL=sua-conexão-postgresql
```

## Executando os Scripts de Configuração

### 1. Verificar a Conexão com o Supabase

Para verificar se a conexão com o Supabase está funcionando corretamente:

```bash
tsx scripts/debug-supabase-connection.ts
```

### 2. Inicializar o Banco de Dados

Para criar todas as tabelas e tipos enumerados necessários no Supabase:

```bash
tsx scripts/init-supabase-db.ts
```

### 3. Configurar Políticas de RLS (Row Level Security)

Para configurar as políticas de segurança para as tabelas:

```bash
tsx scripts/setup-rls.ts
```

### 4. Verificar a Configuração do Banco de Dados

Para verificar se todas as tabelas, enums e políticas foram criadas corretamente:

```bash
tsx scripts/verify-supabase-db.ts
```

### 5. Configuração Completa (Todos os Passos Acima)

Para executar todos os passos acima em sequência:

```bash
tsx scripts/setup-supabase-complete.ts
```

## Populando o Banco de Dados

### Populando Categorias de Serviços e Serviços

```bash
tsx scripts/populate-services-to-supabase.ts
```

### Populando Profissionais

```bash
tsx scripts/populate-professionals-to-supabase.ts
```

### Populando Produtos

```bash
tsx scripts/populate-products-to-supabase.ts
```

### Populando Todos os Dados

```bash
tsx scripts/populate-supabase.ts
```

## Verificações Adicionais

### Verificar Tabelas Existentes

```bash
tsx scripts/check-supabase-tables.ts
```

### Extrair Dados de Serviços para Inserção

```bash
tsx scripts/extract-services-for-supabase.ts
```

### Listar Serviços Cadastrados

```bash
tsx scripts/list-services.ts
```

## Resolução de Problemas

### Erro de Conexão com o Supabase

1. Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo `.env`
2. Confirme se a URL e as chaves do Supabase estão corretas
3. Verifique se o banco de dados PostgreSQL está acessível

### Erro ao Criar Tabelas

1. Execute o script de verificação do banco de dados para identificar quais tabelas não foram criadas
2. Verifique se há erros específicos nos logs
3. Se necessário, execute novamente o script de inicialização do banco de dados

### Erro nas Políticas RLS

1. Verifique se o usuário utilizado tem permissões para configurar políticas RLS
2. Execute o script de verificação para ver quais políticas foram configuradas
3. Se necessário, execute novamente o script de configuração de RLS

## Trabalhando com o Supabase no Código

### Usando o Cliente Supabase

O cliente Supabase está configurado em `server/supabase.ts` e pode ser importado da seguinte forma:

```typescript
import supabase from '../server/supabase';

// Exemplo de uso
const { data, error } = await supabase
  .from('tabela')
  .select('*')
  .limit(10);
```

### Usando o Drizzle ORM com Supabase

O Drizzle ORM está configurado para trabalhar com o Supabase em `server/db.ts` e pode ser usado da seguinte forma:

```typescript
import { db } from '../server/db';
import { tabela } from '../shared/schema';

// Exemplo de uso
const resultado = await db.select().from(tabela).limit(10);
```

## Migrando do Armazenamento Local para o Supabase

A aplicação está configurada para funcionar tanto com armazenamento local quanto com o Supabase. Para alternar entre eles, modifique a configuração em `server/storage.ts`.