
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Usar as credenciais fornecidas ou buscar das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://rrqefsxymripcvoabers.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycWVmc3h5bXJpcGN2b2FiZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODIxMjksImV4cCI6MjA1ODc1ODEyOX0.Jf9UPmqkCWhkrz9NITiW-ioqpFh27O5unW2hJw7XCeo';

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
