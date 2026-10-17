import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@hostelos.local';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME || 'Platform Super Admin';

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: superAdminName,
      email: superAdminEmail,
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('----------------------------------------------------');
  console.log(' Hostels OS Development Seed Completed');
  console.log('----------------------------------------------------');
  console.log(` SUPER_ADMIN created/ensured:`);
  console.log(` ID:    ${superAdmin.id}`);
  console.log(` Email: ${superAdmin.email}`);
  console.log(` Role:  ${superAdmin.role}`);
  console.log(` Status: ${superAdmin.status}`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
