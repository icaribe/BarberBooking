# Integração com Supabase

Este documento detalha a integração da aplicação Los Barbeiros CBS com o Supabase para banco de dados, autenticação e armazenamento.

## Configuração Realizada

✅ **Variáveis de Ambiente**: Configuradas em `.env`
✅ **Conexão com Banco de Dados**: Estabelecida com PostgreSQL do Supabase
✅ **Autenticação**: Integração com Supabase Auth para login/registro
✅ **Sincronização de Usuários**: Usuários sincronizados entre app e Supabase Auth

## Estrutura de Arquivos de Integração

- `shared/supabase-client.ts`: Cliente Supabase centralizado (anônimo e admin)
- `server/supabase.ts`: Utilizado nas operações de servidor que ignoram RLS
- `server/storage-supabase.ts`: Implementação de storage usando Supabase
- `server/auth.ts`: Integração de autenticação com Supabase
- `scripts/`: Contém scripts para configuração, sincronização e verificação

## Scripts de Manutenção

Os seguintes scripts estão disponíveis para gerenciar a integração:

1. **Verificação de Conexão**:
   ```
   npx tsx scripts/debug-supabase-connection.ts
   ```
   Verifica se a conexão com o Supabase está funcionando corretamente.

2. **Sincronização de Autenticação**:
   ```
   npx tsx scripts/sync-auth-with-supabase.ts
   ```
   Sincroniza usuários existentes com o sistema de autenticação do Supabase.

3. **Configuração Completa**:
   ```
   npx tsx scripts/setup-supabase-complete.ts
   ```
   Executa todo o processo de configuração em uma única etapa.

## Limitações e Considerações

- **Políticas de RLS (Row Level Security)**: Devido a limitações da API Supabase, as políticas de RLS precisam ser configuradas manualmente no painel de administração do Supabase.
- **Função `exec` para SQL personalizado**: Não disponível via API, requer configuração manual.

## Configuração das Políticas RLS (Necessário Fazer Manualmente)

Para configurar as políticas de Row Level Security (RLS), acesse o painel de administração do Supabase e configure as seguintes políticas para cada tabela:

### Tabela `users`
- Permitir que usuários leiam seus próprios dados (`auth.uid() = auth_id`)
- Permitir que usuários atualizem seus próprios dados (`auth.uid() = auth_id`)
- Permitir que admins gerenciem todos os usuários (`role = 'admin'`)

### Tabela `appointments` (Agendamentos)
- Permitir que usuários leiam seus próprios agendamentos
- Permitir que profissionais vejam agendamentos com eles
- Permitir que admins gerenciem todos os agendamentos

### (Outras tabelas seguem padrões similares)

## Sincronização de Autenticação

A integração mantém a compatibilidade entre o sistema de autenticação atual (Passport.js) e o Supabase Auth:

1. Quando um usuário faz login, o sistema verifica primeiro no Supabase Auth
2. Se falhar, tenta o sistema de autenticação local (fallback)
3. Ao criar usuários, eles são criados tanto no banco local quanto no Supabase Auth

## Próximos Passos

1. Configurar políticas de RLS manualmente no painel do Supabase
2. Implementar transição completa para autenticação via Supabase (em andamento)
3. Configurar storage para uploads e arquivos usando Supabase Storage

## Troubleshooting

### Erro ao autenticar
Se ocorrer erro de autenticação, verifique:
- As chaves de API do Supabase estão corretas
- O usuário existe no banco de dados do Supabase
- O usuário foi sincronizado com o Supabase Auth

### Erro de conexão com o banco de dados
- Verifique a configuração de DATABASE_URL e variáveis PGHOST/PGUSER
- Verifique se o IP está liberado nas regras de acesso do Supabase

## Recursos Oficiais do Supabase

- [Documentação do Supabase](https://supabase.io/docs)
- [Autenticação com Supabase](https://supabase.io/docs/guides/auth)
- [Políticas RLS](https://supabase.io/docs/guides/auth/row-level-security)