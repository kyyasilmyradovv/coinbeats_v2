const cron = require('node-cron');
const selectRaffleWinners = require('./functions/selectRaffleWinners');

cron.schedule('0 * * * *', async () => {
  await selectRaffleWinners();
});
