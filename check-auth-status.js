/**
 * Script para verificar o status da autenticação no Supabase
 * para diagnosticar problemas de acesso às APIs
 */

import 'dotenv/config';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000'; // URL da API local

async function checkAuthStatus() {
  try {
    console.log('🔍 Verificando status da autenticação no servidor...');
    
    // 1. Verificar endpoint de usuário atual (sem autenticação)
    console.log('\n👤 Testando endpoint /api/user sem autenticação...');
    
    try {
      const userResponse = await fetch(`${baseUrl}/api/user`, {
        credentials: 'include'
      });
      
      console.log(`Status: ${userResponse.status} ${userResponse.statusText}`);
      
      if (userResponse.status === 401) {
        console.log('✅ Comportamento esperado: o endpoint retorna 401 quando não autenticado.');
      } else if (userResponse.ok) {
        console.log('⚠️ Comportamento inesperado: o endpoint retornou 200 sem autenticação.');
        const userData = await userResponse.json();
        console.log('Dados retornados:', userData);
      } else {
        console.log('⚠️ Resposta inesperada do endpoint.');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar endpoint de usuário:', error);
    }
    
    // 2. Testar endpoint público de serviços
    console.log('\n📋 Testando endpoint público /api/services...');
    
    try {
      const servicesResponse = await fetch(`${baseUrl}/api/services`);
      
      console.log(`Status: ${servicesResponse.status} ${servicesResponse.statusText}`);
      
      if (servicesResponse.ok) {
        const services = await servicesResponse.json();
        console.log(`✅ Endpoints públicos funcionando. Retornados ${services.length} serviços.`);
      } else {
        console.log('❌ Falha ao acessar endpoint público.');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar endpoint de serviços:', error);
    }
    
    // 3. Verificar endpoint administrativo sem autenticação
    console.log('\n🔒 Testando endpoint administrativo sem autenticação...');
    
    try {
      const adminResponse = await fetch(`${baseUrl}/api/admin/appointments`);
      
      console.log(`Status: ${adminResponse.status} ${adminResponse.statusText}`);
      
      if (adminResponse.status === 401) {
        console.log('✅ Comportamento esperado: o endpoint administrativo retorna 401 quando não autenticado.');
        const errorText = await adminResponse.text();
        console.log('Mensagem:', errorText);
      } else {
        console.log('⚠️ Comportamento inesperado do endpoint administrativo.');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar endpoint administrativo:', error);
    }
    
    // 4. Realizar login de teste com credenciais fixas para debug
    console.log('\n🔑 Realizando login de teste para verificar autenticação...');
    
    // Usar credenciais fixas para teste
    const testUsername = 'admin';
    const testPassword = 'admin';
    
    console.log(`Tentando login com usuário: ${testUsername} (senha: ${testPassword})`);
    
    // Tentar autenticar localmente no aplicativo
    try {
      console.log('\n📡 Testando API de login local...');
      const loginResponse = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUser.username,
          password: 'admin' // Senha padrão para teste (admin)
        }),
        credentials: 'include',
      });
      
      console.log(`Status: ${loginResponse.status} ${loginResponse.statusText}`);
      
      if (loginResponse.ok) {
        const userData = await loginResponse.json();
        console.log('✅ Login bem-sucedido!');
        console.log('Dados retornados:', userData);
        
        // Obter cookies da resposta
        const cookies = loginResponse.headers.raw()['set-cookie'];
        if (cookies && cookies.length > 0) {
          console.log('✅ Cookies de sessão definidos:');
          cookies.forEach(cookie => {
            console.log(`- ${cookie.split(';')[0]}`);
          });
          
          // Testar API protegida com os cookies
          console.log('\n🔒 Testando API protegida com cookies de sessão...');
          
          // Extrair connect.sid do cookie
          const sessionCookie = cookies.find(c => c.includes('connect.sid='));
          
          if (sessionCookie) {
            const apiResponse = await fetch(`${baseUrl}/api/admin/appointments`, {
              headers: {
                'Cookie': sessionCookie
              },
              credentials: 'include',
            });
            
            console.log(`Status da API protegida: ${apiResponse.status} ${apiResponse.statusText}`);
            
            if (apiResponse.ok) {
              console.log('✅ Acesso à API protegida bem-sucedido!');
              const data = await apiResponse.json();
              console.log(`Retornados ${data.length} agendamentos.`);
            } else {
              console.log('❌ Falha ao acessar API protegida.');
              try {
                const errorText = await apiResponse.text();
                console.log('Resposta de erro:', errorText);
              } catch (e) {
                console.log('Não foi possível ler resposta de erro.');
              }
            }
          } else {
            console.log('⚠️ Nenhum cookie de sessão encontrado na resposta.');
          }
        } else {
          console.log('⚠️ Nenhum cookie retornado na resposta de login.');
        }
      } else {
        console.log('❌ Falha no login com o usuário de teste.');
        try {
          const errorText = await loginResponse.text();
          console.log('Resposta de erro:', errorText);
        } catch (e) {
          console.log('Não foi possível ler resposta de erro.');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao testar login:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para criar um usuário de teste se necessário
async function createTestUser() {
  try {
    console.log('\n🆕 Criando usuário de teste para verificação...');
    
    // 1. Verificar se já existe um usuário admin
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('role', 'admin')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar usuários admin existentes:', checkError.message);
      return;
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✅ Usuário admin existente encontrado:', existingAdmins[0].username);
      return;
    }
    
    // 2. Criar usuário no Supabase Auth
    console.log('Criando usuário no Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Erro ao criar usuário no Auth:', authError.message);
      return;
    }
    
    if (!authUser || !authUser.user) {
      console.error('❌ Falha ao criar usuário no Auth. Nenhum dado retornado.');
      return;
    }
    
    console.log('✅ Usuário criado no Auth:', authUser.user.id);
    
    // 3. Criar usuário na tabela de usuários da aplicação
    console.log('Criando registro na tabela de usuários...');
    const { data: appUser, error: appError } = await supabase
      .from('users')
      .insert([{
        auth_id: authUser.user.id,
        username: 'admin',
        password: 'admin123', // Deve ser hash na produção
        email: 'admin@example.com',
        name: 'Administrador',
        role: 'admin'
      }])
      .select();
    
    if (appError) {
      console.error('❌ Erro ao criar usuário na aplicação:', appError.message);
      return;
    }
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('Detalhes:', appUser?.[0]);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

// Executar a verificação de autenticação
(async function() {
  await checkAuthStatus();
  
  // Descomentar para criar um usuário de teste se necessário
  // await createTestUser();
})();