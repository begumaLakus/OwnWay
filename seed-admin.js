/**
 * Admin kullanıcısını veritabanına ekler.
 * Çalıştırmak için: node seed-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin123';

  // Mevcut admin kontrolü
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    // Sadece rolünü güncelle
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Mevcut kullanıcı "${adminEmail}" rolü ADMIN olarak güncellendi.`);
    return;
  }

  // Admin kullanıcısı oluştur
  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password_hash: hashed,
      role: 'ADMIN',
      profile: {
        create: {
          first_name: 'Admin',
          last_name: 'OwnWay',
        },
      },
    },
  });

  console.log(`✅ Admin kullanıcısı oluşturuldu!`);
  console.log(`   📧 E-posta : ${adminEmail}`);
  console.log(`   🔑 Şifre   : ${adminPassword}`);
  console.log(`   🆔 ID      : ${admin.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
