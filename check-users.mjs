import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('=== BAĞLANTI ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const deptCount = await prisma.department.count();
const uniCount = await prisma.university.count();
const cityCount = await prisma.city.count();

console.log('\n=== TABLO SAYILARI ===');
console.log('Şehir sayısı:', cityCount);
console.log('Üniversite sayısı:', uniCount);
console.log('Bölüm sayısı:', deptCount);

if (deptCount > 0) {
  const sample = await prisma.department.findMany({ take: 5 });
  console.log('\n=== İLK 5 BÖLÜM ===');
  console.log(JSON.stringify(sample, null, 2));
} else {
  console.log('\n⚠️  departments tablosu BOŞ!');
}

await prisma.$disconnect();
