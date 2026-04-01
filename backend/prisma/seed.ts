import { PrismaClient, UserRole, ClientStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === 'production';

const getRequiredSeedAdminPassword = (): string => {
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('Defina SEED_ADMIN_PASSWORD para executar o seed com segurança.');
  }

  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD deve ter no minimo 12 caracteres.');
  }

  return password;
};

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  if (isProduction) {
    throw new Error('Seed bloqueado em producao por seguranca.');
  }

  //  Criar usuário admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@home3.com.br';
  const adminPasswordHash = await bcrypt.hash(getRequiredSeedAdminPassword(), 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
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
