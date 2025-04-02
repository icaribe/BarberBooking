
import { storage } from '../server/storage';
import { hash } from 'bcrypt';

async function setupInitialUsers() {
  try {
    // Criar usuário admin (Johnata)
    const adminPassword = await hash('admin123', 10);
    const admin = await storage.createUser({
      username: 'johnata',
      password: adminPassword,
      name: 'Johnata',
      email: 'johnata@losbarbeiros.com',
      role: 'admin',
      permissions: {
        canManageUsers: true,
        canManageServices: true,
        canManageProducts: true,
        canViewFinancials: true
      }
    });
    
    console.log('✅ Admin criado:', admin.username);

    // Criar usuário secretária
    const secretaryPassword = await hash('secretary123', 10);
    await storage.createUser({
      username: 'secretary',
      password: secretaryPassword,
      name: 'Secretária',
      email: 'secretary@losbarbeiros.com',
      role: 'secretary',
      permissions: {
        canManageAppointments: true,
        canViewFinancials: true
      }
    });
    
    console.log('✅ Secretária criada');

    // Criar usuários para cada profissional existente
    const professionals = await storage.getProfessionals();
    
    for (const professional of professionals) {
      if (professional.name === 'Johnata') continue; // Pular Johnata pois já é admin
      
      const tempPassword = await hash('barbeiro123', 10);
      await storage.createUser({
        username: professional.name.toLowerCase(),
        password: tempPassword,
        name: professional.name,
        email: `${professional.name.toLowerCase()}@losbarbeiros.com`,
        role: 'professional',
        permissions: {
          canManageOwnSchedule: true,
          canViewOwnAppointments: true
        }
      });
      
      console.log(`✅ Profissional criado: ${professional.name}`);
    }

    console.log('\n✨ Configuração inicial de usuários concluída!');
    console.log('\nSenhas temporárias:');
    console.log('Admin (Johnata): admin123');
    console.log('Secretária: secretary123');
    console.log('Demais profissionais: barbeiro123');
    console.log('\nPor favor, solicite que todos alterem suas senhas no primeiro acesso.');

  } catch (error) {
    console.error('❌ Erro ao configurar usuários:', error);
  }
}

setupInitialUsers();
