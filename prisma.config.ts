import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Eğer .env okunmadıysa Melike'ye uyarı verir
  console.warn("⚠️ DATABASE_URL .env dosyasında bulunamadı!");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});