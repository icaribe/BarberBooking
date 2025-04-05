// Script para adicionar a coluna role diretamente via Supabase
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

async function addTextRoleColumn() {
  try {
    console.log('Tentando adicionar a coluna role como tipo TEXT...');
    
    // Verificar se a coluna role já existe
    let result;
    try {
      result = await supabase
        .from('users')
        .select('role')
        .limit(1);
        
      if (!result.error) {
        console.log('A coluna role já existe na tabela users');
        return true;
      }
    } catch (err) {
      console.log('Erro ao verificar coluna (esperado se não existir):', err.message);
    }
    
    console.log('A coluna role não foi encontrada ou houve erro. Tentando adicionar...');
    
    // Tentar buscar informações sobre a tabela
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .limit(1);
      
      if (usersError) {
        console.error('Erro ao acessar tabela users:', usersError);
        return false;
      }
      
      console.log('Tabela users encontrada com sucesso');
      
      if (users && users.length > 0) {
        const userId = users[0].id;
        console.log(`Encontrado usuário com ID ${userId}`);
        
        // Atualizar o primeiro usuário adicionando o campo role
        // Isso pode resultar em erro se a coluna não existir
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'customer' })
            .eq('id', userId);
          
          if (!updateError) {
            console.log(`Usuário ${userId} atualizado com role='customer'`);
            return true;
          } else {
            console.log('Erro ao atualizar (esperado se coluna não existir):', updateError);
          }
        } catch (updateErr) {
          console.log('Erro na atualização:', updateErr.message);
        }
        
        // Tentar inserir um usuário de teste incluindo o campo role
        try {
          const randomId = Math.floor(Math.random() * 1000000) + 10000;
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: randomId,
              username: `temp_${randomId}`,
              email: `temp_${randomId}@example.com`,
              password: 'temporary',
              role: 'customer'
            });
          
          if (!insertError) {
            console.log('Usuário temporário inserido com coluna role');
            
            // Remover o usuário de teste
            await supabase
              .from('users')
              .delete()
              .eq('id', randomId);
              
            console.log('Usuário temporário removido');
            return true;
          } else {
            console.log('Erro ao inserir com coluna role:', insertError);
          }
        } catch (insertErr) {
          console.log('Erro na inserção:', insertErr.message);
        }
      }
    } catch (error) {
      console.error('Erro na consulta de usuários:', error);
    }
    
    // Verificar novamente se a coluna foi adicionada
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .limit(1);
      
      if (!error) {
        console.log('Verificação final: a coluna role existe agora!');
        return true;
      } else {
        console.error('A coluna role ainda não existe após tentativas:', error);
      }
    } catch (err) {
      console.log('Erro na verificação final:', err.message);
    }
    
    return false;
  } catch (error) {
    console.error('Erro não tratado:', error);
    return false;
  }
}

// Executar a função e finalizar o processo
addTextRoleColumn()
  .then(success => {
    if (success) {
      console.log('Processo concluído com sucesso');
      process.exit(0);
    } else {
      console.error('Falha no processo');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Erro não tratado:', err);
    process.exit(1);
  });