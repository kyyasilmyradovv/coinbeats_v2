const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const resetUserLastWeekPointCounts = async () => {
  try {
    await prisma.user.updateMany({
      data: {
        lastWeekPointCount: 0,
      },
    });

    console.log(
      'User lastWeekPointCounts has reset (set to 0) by cron job. Time: ',
      new Date()
    );
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = resetUserLastWeekPointCounts;
