// Script to clean up duplicate apps and keep only 1 per user
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Get all apps grouped by userId
  const apps = await prisma.app.findMany({ orderBy: { createdAt: "asc" } });
  
  const byUser = {};
  for (const app of apps) {
    if (!byUser[app.userId]) byUser[app.userId] = [];
    byUser[app.userId].push(app);
  }

  let deleted = 0;
  for (const [userId, userApps] of Object.entries(byUser)) {
    if (userApps.length > 1) {
      // Keep the FIRST app, delete the rest
      const toDelete = userApps.slice(1).map(a => a.id);
      console.log(`User ${userId}: keeping 1 app, deleting ${toDelete.length} duplicates`);
      await prisma.app.deleteMany({ where: { id: { in: toDelete } } });
      deleted += toDelete.length;
    } else {
      console.log(`User ${userId}: 1 app (ok)`);
    }
  }

  console.log(`\nDone! Deleted ${deleted} duplicate apps.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
