const cron = require('node-cron');
const selectRaffleWinners = require('./functions/selectRaffleWinners');
const resetUserLastWeekPointCounts = require('./functions/resetUserLastWeekPointCounts');

cron.schedule('0 * * * *', async () => {
  await selectRaffleWinners();
});

cron.schedule('0 0 * * 1', async () => {
  await resetUserLastWeekPointCounts();
});
