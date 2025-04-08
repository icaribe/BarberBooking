
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import supabase from './supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

let db: PostgresJsDatabase<typeof schema>;

// Conexão com o banco de dados Supabase usando pooler
const connectionString = process.env.DATABASE_URL;

// Usar o banco de dados PostgreSQL do Replit quando disponível
const useReplitDB = !!process.env.PGHOST && !!process.env.PGDATABASE;

// Construir URL de conexão do PostgreSQL a partir das variáveis individuais, caso DATABASE_URL não esteja definido
const buildConnectionString = () => {
  if (connectionString) return connectionString;
  
  if (useReplitDB) {
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  }
  
  // Usar banco de dados Supabase como fallback
  return `postgresql://postgres:postgres@db.rrqefsxymripcvoabers.supabase.co:5432/postgres?schema=public`;
};

const finalConnectionString = buildConnectionString();

console.log('✅ Conectando ao banco de dados PostgreSQL...');

// Configuração do cliente Postgres com SSL necessário para Supabase
const queryClient = postgres(finalConnectionString, {
  ssl: 'require',
  max: 10, // Número máximo de conexões no pool
  idle_timeout: 30, // Tempo em segundos para manter conexões ociosas
});

// Inicializar o Drizzle ORM com o cliente Postgres
db = drizzle(queryClient, { schema });

export { db };
