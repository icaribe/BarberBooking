// Script para verificar a estrutura da tabela users
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  try {
    // Listar todas as tabelas
    console.log('Tentando listar tabelas...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Erro ao acessar tabela users:', usersError);
    } else {
      console.log('Tabela users está acessível');
      console.log('Estrutura do primeiro registro:');
      console.log(JSON.stringify(users[0], null, 2));
      
      // Verificar as colunas disponíveis
      if (users && users.length > 0) {
        console.log('Colunas disponíveis em users:');
        for (const key in users[0]) {
          console.log(`- ${key}: ${typeof users[0][key]}`);
        }
      }
    }
    
    console.log('\nVerificando tabelas disponíveis no schema public...');
    try {
      // Usando uma consulta direta quando possível
      const { data: sysData, error: sysError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (sysError) {
        console.error('Erro ao executar consulta system_schema:', sysError);
      } else {
        console.log('Consulta de sistema bem-sucedida');
      }
    } catch (err) {
      console.error('Erro ao executar consulta de tabelas:', err);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
checkTableStructure()
  .then(() => {
    console.log('Verificação concluída');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro ao executar o script:', err);
    process.exit(1);
  });