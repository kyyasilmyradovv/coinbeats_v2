const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getOverallRaffles = asyncHandler(async (req, res, next) => {
  let overallRaffles = [];

  if (req.user?.id) {
    overallRaffles = await prisma.$queryRaw`
      SELECT
        a.name,
        a."logoUrl",
        r.deadline,
        r.reward,
        r."winnersCount",
        r.type,
        (
	        SELECT amount
	        FROM "AcademyRaffleEntries" AS entries
	        WHERE entries."userId" = ${req.user?.id} AND entries."academyId" = r."academyId"
    	  ) AS "yourRaffleCount"
      FROM
        "OverallRaffle" AS r
      LEFT JOIN "Academy" AS a ON a.id = r."academyId"
      --WHERE
        --r."isActive" = true AND r.deadline > NOW() 
      ORDER BY
        CASE WHEN r.type = 'PLATFORM' THEN 0 ELSE 1 END,
        r.deadline ASC;
    `;
  } else {
    overallRaffles = await prisma.$queryRaw`
      SELECT
        a.name,
        a."logoUrl",
        r.deadline,
        r.reward,
        r."winnersCount",
        r.type
      FROM
        "OverallRaffle" AS r
      LEFT JOIN "Academy" AS a ON a.id = r."academyId"
      --WHERE
        --r."isActive" = true AND r.deadline > NOW() 
      ORDER BY
        CASE WHEN r.type = 'PLATFORM' THEN 0 ELSE 1 END,
        r.deadline ASC;
    `;
  }

  // for (let r of overallRaffles) {
  //   if (r.deadline) r.deadline = r.deadline.toString();
  // }

  res.status(200).send(overallRaffles);
});

// exports.getMyRaffles = async (req, res, next) => {
//   try {
//     const userId = +req.query?.userId;

//     // Try to find the existing Raffle for the user
//     let raffles = await prisma.raffle.findMany({
//       where: { userId },
//       orderBy: { id: 'desc' },
//       include: {
//         academy: true,
//         task: true,
//       },
//     });

//     res.status(200).json(raffles);
//   } catch (error) {
//     console.error('Error fetching my raffles:', error);
//     next(createError(500, 'Error fetching my raffles'));
//   }
// };

// exports.getMyTotalRaffles = async (req, res, next) => {
//   try {
//     const userId = +req.query?.userId;

//     // Try to find the existing Raffle for the user
//     let user = await prisma.user.findFirst({
//       where: { id: userId },
//     });

//     res.status(200).json(user?.raffleAmount);
//   } catch (error) {
//     console.error('Error fetching surprise box:', error);
//     next(createError(500, 'Error fetching surprise box'));
//   }
// };
