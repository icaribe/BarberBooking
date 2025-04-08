/**
 * Script de configuração completa do Supabase
 * 
 * Este script executa todos os passos necessários para configurar
 * completamente o Supabase como banco de dados do projeto.
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão configuradas
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("❌ Erro: As variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY e DATABASE_URL são necessárias");
  process.exit(1);
}

// Função para executar um script TypeScript
async function runScript(scriptPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n🚀 Executando script: ${scriptPath}...\n`);
    
    const child = spawn('tsx', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Script ${scriptPath} executado com sucesso!\n`);
        resolve(true);
      } else {
        console.error(`\n❌ Script ${scriptPath} falhou com código ${code}\n`);
        resolve(false);
      }
    });
  });
}

// Função principal para executar todos os scripts
async function setupSupabaseComplete() {
  console.log("\n🔄 Iniciando configuração completa do Supabase...\n");
  
  try {
    // Passo 1: Verificar conexão com o Supabase
    console.log("\n📡 PASSO 1: Verificando conexão com o Supabase...\n");
    const connectionSuccess = await runScript('./scripts/debug-supabase-connection.ts');
    
    if (!connectionSuccess) {
      console.error("\n❌ Falha na conexão com o Supabase. Verifique as credenciais e tente novamente.\n");
      process.exit(1);
    }
    
    // Passo 2: Inicializar banco de dados no Supabase
    console.log("\n📊 PASSO 2: Inicializando banco de dados no Supabase...\n");
    const initSuccess = await runScript('./scripts/init-supabase-db.ts');
    
    if (!initSuccess) {
      console.error("\n❌ Falha na inicialização do banco de dados. Verifique os logs para mais detalhes.\n");
      process.exit(1);
    }
    
    // Passo 3: Configurar políticas RLS
    console.log("\n🔒 PASSO 3: Configurando políticas de segurança RLS...\n");
    const rlsSuccess = await runScript('./scripts/setup-rls.ts');
    
    if (!rlsSuccess) {
      console.error("\n⚠️ Houve problemas na configuração das políticas RLS. Verifique os logs para mais detalhes.\n");
      // Continuar mesmo com erro nas políticas RLS
    }
    
    // Passo 4: Verificar a configuração do banco de dados
    console.log("\n🔍 PASSO 4: Verificando configuração do banco de dados...\n");
    await runScript('./scripts/verify-supabase-db.ts');
    
    console.log("\n🎉 Configuração completa do Supabase finalizada com sucesso!\n");
    console.log("\n📝 Próximos passos:");
    console.log("1. Execute a aplicação com 'npm run dev'");
    console.log("2. Utilize os scripts na pasta 'scripts' para outras operações específicas");
    console.log("3. Para popular o banco com dados de exemplo, execute 'npm run populate:supabase'");
    
  } catch (error) {
    console.error("\n❌ Erro durante a configuração do Supabase:", error);
    process.exit(1);
  }
}

// Executar o script
setupSupabaseComplete().catch(console.error);