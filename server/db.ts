
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { supabase } from './supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

let db: PostgresJsDatabase<typeof schema>;

// Verificar se estamos em ambiente de produção ou desenvolvimento
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar a conexão do Supabase através da URL do banco de dados
  const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@db.rrqefsxymripcvoabers.supabase.co:5432/postgres`;
  const queryClient = postgres(connectionString);
  db = drizzle(queryClient, { schema });
} else {
  // Em desenvolvimento, ainda podemos usar a conexão local se existir
  const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@db.rrqefsxymripcvoabers.supabase.co:5432/postgres`;
  const queryClient = postgres(connectionString);
  db = drizzle(queryClient, { schema });
}

export { db };
