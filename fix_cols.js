const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // dept_type: VARCHAR(10) -> VARCHAR(100) genişlet
  await prisma.$executeRaw`ALTER TABLE user_profiles ALTER COLUMN dept_type TYPE VARCHAR(100)`;
  console.log('dept_type -> VARCHAR(100) OK');

  // role alanı da VARCHAR(20), schema VarChar(50) diyor - genişlet
  await prisma.$executeRaw`ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50)`;
  console.log('users.role -> VARCHAR(50) OK');

  // password_hash VARCHAR(255) yeterli ama şifreyi de kontrol et
  // bcrypt hash'i ~60 karakter, 255 yeterli

  // Kontrol et
  const cols = await prisma.$queryRaw`
    SELECT column_name, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles'
    ORDER BY ordinal_position
  `;
  console.log('\nGüncel boyutlar:');
  cols.forEach(c => console.log(`  ${c.column_name}: ${c.character_maximum_length}`));

  await prisma.$disconnect();
  console.log('\nTamamlandı!');
}
main().catch(e => { console.error(e.message); process.exit(1); });
