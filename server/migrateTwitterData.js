const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTwitterData() {
  const usersWithTwitterData = await prisma.user.findMany({
    where: {
      NOT: {
        twitterUserId: null,
      },
    },
  });

  for (const user of usersWithTwitterData) {
    await prisma.twitterAccount.create({
      data: {
        userId: user.id,
        twitterUserId: user.twitterUserId,
        twitterUsername: user.twitterUsername,
        twitterAccessToken: user.twitterAccessToken,
        twitterAccessTokenSecret: user.twitterAccessTokenSecret, // If applicable
        twitterRefreshToken: user.twitterRefreshToken,
        twitterTokenExpiresAt: user.twitterTokenExpiresAt,
        connectedAt: user.updatedAt || new Date(),
      },
    });
  }

  console.log('Twitter data migration completed.');
}

migrateTwitterData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
