import { PrismaClient, RoleName } from "./generated/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ name: RoleName.USER }, { name: RoleName.ORGANIZER }],
    skipDuplicates: true, // biar tidak error kalau sudah ada
  });
  console.log("✅ Seed Role success");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
