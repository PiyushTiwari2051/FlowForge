const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users);
    const apps = await prisma.app.findMany();
    console.log("Apps in DB:", apps.map(a => ({ id: a.id, name: a.name, userId: a.userId })));
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
