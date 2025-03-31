
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { supabase } from './supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

let db: PostgresJsDatabase<typeof schema>;

// Conexão com o banco de dados Supabase usando pooler
const connectionString = process.env.DATABASE_URL || `postgresql://postgres.rrqefsxymripcvoabers:LJjub0vLawnmKMfV@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

// Configuração do cliente Postgres com SSL necessário para Supabase
const queryClient = postgres(connectionString, {
  ssl: 'require',
  max: 10, // Número máximo de conexões no pool
  idle_timeout: 30, // Tempo em segundos para manter conexões ociosas
});

// Inicializar o Drizzle ORM com o cliente Postgres
db = drizzle(queryClient, { schema });

export { db };
