import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Verificar se a variável de ambiente DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não está definida!');
  process.exit(1);
}

// Criar conexão com o PostgreSQL
const queryClient = postgres(process.env.DATABASE_URL);

// Criar instância do Drizzle com o schema
export const db = drizzle(queryClient, { schema });