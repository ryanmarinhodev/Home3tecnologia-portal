import { PrismaClient, UserRole, ClientStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@home3.com.br' },
    update: {},
    create: {
      email: 'admin@home3.com.br',
      passwordHash: adminPasswordHash,
      name: 'Administrador',
      role: UserRole.ADMIN,
      status: ClientStatus.ACTIVE,
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar cliente de exemplo
  const clientPasswordHash = await bcrypt.hash('cliente123', 10);
  
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      email: 'cliente@exemplo.com',
      passwordHash: clientPasswordHash,
      name: 'Cliente Exemplo',
      role: UserRole.CLIENT,
      status: ClientStatus.ACTIVE,
      client: {
        create: {
          companyName: 'Empresa Exemplo LTDA',
          phone: '(11) 99999-9999',
          googleDriveFolderId: 'SUBSTITUA_PELO_ID_DA_PASTA_NO_DRIVE',
          googleDriveFolderName: 'Projeto Cliente Exemplo',
        },
      },
    },
  });

  console.log('✅ Cliente de exemplo criado:', clientUser.email);

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
