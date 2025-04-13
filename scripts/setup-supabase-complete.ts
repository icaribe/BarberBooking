import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para configuração completa do Supabase
 * Executa todos os scripts de configuração em sequência
 */
async function setupSupabaseComplete() {
  console.log('\n🚀 Iniciando configuração completa do Supabase...\n');

  try {
    // 1. Verificar conexão com o Supabase
    console.log('1️⃣ Verificando conexão com o Supabase...');
    runScript('./scripts/debug-supabase-connection.ts');
    
    // 2. Sincronizar autenticação com Supabase
    console.log('\n2️⃣ Sincronizando autenticação com Supabase Auth...');
    runScript('./scripts/sync-auth-with-supabase.ts');
    
    // 3. Inicializar banco de dados (se necessário)
    console.log('\n3️⃣ Verificando e inicializando banco de dados...');
    // O script debug-supabase-connection já mostrou que as tabelas existem
    // Não precisamos executar init-supabase-db.ts
    console.log('✅ Tabelas já existem no Supabase, pulando inicialização');
    
    // 4. Configurar políticas RLS
    console.log('\n4️⃣ Configurando políticas de segurança RLS...');
    runScript('./scripts/setup-rls.ts');
    
    // 5. Verificar configuração
    console.log('\n5️⃣ Verificando configuração final...');
    runScript('./scripts/verify-supabase-db.ts');
    
    console.log("\n🎉 Configuração completa do Supabase finalizada com sucesso!\n");
    console.log("\n📝 Próximos passos:");
    console.log("1. Execute a aplicação com 'npm run dev'");
    console.log("2. Utilize os scripts na pasta 'scripts' para outras operações específicas");
    console.log("3. Para popular o banco com dados de exemplo, crie e execute um script de população de dados");
    
  } catch (error) {
    console.error("\n❌ Erro durante a configuração:", error);
    process.exit(1);
  }
}

/**
 * Função auxiliar para executar um script TypeScript
 */
function runScript(scriptPath: string) {
  try {
    // Usar execSync para que seja executado de forma síncrona
    execSync(`npx tsx ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Erro ao executar o script ${scriptPath}:`, error);
    throw error; // Re-lançar o erro para ser capturado na função principal
  }
}

// Executar a função principal
setupSupabaseComplete().catch(error => {
  console.error('Erro fatal durante a configuração completa:', error);
  process.exit(1);
});