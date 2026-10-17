import { PrismaClient, Role, UserStatus, PropertyStatus, PropertyType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL || 'dt.adittarajpatil@gmail.com';
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD || 'dt.aditya@2026';
  const superAdminName =
    process.env.SEED_SUPER_ADMIN_NAME || 'Aditya Raj Patil';

  const saltRounds = 10;
  const superAdminHash = await bcrypt.hash(superAdminPassword, saltRounds);
  const defaultAdminHash = await bcrypt.hash('HostelAdmin@123', saltRounds);

  // 1. Create or Update Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: superAdminName,
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: superAdminName,
      email: superAdminEmail,
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 2. Seed Initial Hostels / Properties
  const initialPropertiesData = [
    {
      name: 'Grand Skyline Premier Hostel',
      propertyType: PropertyType.HOSTEL,
      address: 'Opp. University North Gate, Powai Road, Mumbai',
      status: PropertyStatus.ACTIVE,
      adminName: 'Rahul Sharma',
      adminEmail: 'rahul.sharma@skylinehostels.com',
    },
    {
      name: 'Greenwood Heights Co-living & PG',
      propertyType: PropertyType.PG,
      address: 'Viman Nagar, Near Symbiosis Campus, Pune',
      status: PropertyStatus.ACTIVE,
      adminName: 'Sneha Patil',
      adminEmail: 'sneha.patil@greenwoodpg.in',
    },
    {
      name: 'Heritage Residency Boys Hostel',
      propertyType: PropertyType.HOSTEL,
      address: 'Koramangala 4th Block, 80 Feet Road, Bangalore',
      status: PropertyStatus.INACTIVE,
      adminName: 'Amit Verma',
      adminEmail: 'amit.verma@heritageresidency.com',
    },
    {
      name: 'Elite Scholars Executive Hostel',
      propertyType: PropertyType.HOSTEL,
      address: 'North Campus, GTB Nagar Metro Station, Delhi',
      status: PropertyStatus.ACTIVE,
      adminName: 'Priya Kulkarni',
      adminEmail: 'priya.k@elitescholars.edu',
    },
  ];

  for (const item of initialPropertiesData) {
    // Check or create property
    let prop = await prisma.property.findFirst({
      where: { name: item.name },
    });

    if (!prop) {
      prop = await prisma.property.create({
        data: {
          name: item.name,
          propertyType: item.propertyType,
          address: item.address,
          status: item.status,
        },
      });
    }

    // Check or create property administrator
    const adminUser = await prisma.user.upsert({
      where: { email: item.adminEmail },
      update: {
        name: item.adminName,
        status: item.status === PropertyStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      },
      create: {
        name: item.adminName,
        email: item.adminEmail,
        passwordHash: defaultAdminHash,
        role: Role.PROPERTY_ADMIN,
        status: item.status === PropertyStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      },
    });

    // Link Property and Admin
    await prisma.propertyUser.upsert({
      where: {
        unique_user_property_assignment: {
          userId: adminUser.id,
          propertyId: prop.id,
        },
      },
      update: {
        role: Role.PROPERTY_ADMIN,
      },
      create: {
        userId: adminUser.id,
        propertyId: prop.id,
        role: Role.PROPERTY_ADMIN,
      },
    });
  }

  console.log('----------------------------------------------------');
  console.log(' HostelOS Development Seed Completed');
  console.log('----------------------------------------------------');
  console.log(` SUPER_ADMIN created/ensured:`);
  console.log(` ID:       ${superAdmin.id}`);
  console.log(` Name:     ${superAdmin.name}`);
  console.log(` Email:    ${superAdmin.email}`);
  console.log(` Password: ${superAdminPassword}`);
  console.log(` Role:     ${superAdmin.role}`);
  console.log(` Status:   ${superAdmin.status}`);
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
