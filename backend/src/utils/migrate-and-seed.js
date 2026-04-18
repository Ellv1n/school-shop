require('dotenv').config();
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Running migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations done');
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }

  // Check if already seeded
  const categoryCount = await prisma.category.count();
  if (categoryCount > 0) {
    console.log('⏭️  Database already seeded, skipping...');
    await prisma.$disconnect();
    return;
  }

  console.log('🌱 Seeding database...');
  // Run seed
  require('./seed');
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
