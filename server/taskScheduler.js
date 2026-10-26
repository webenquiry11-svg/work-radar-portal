const cron = require('node-cron');
const { processPastDueTasks } = require('./controllers/pastDueTaskProcessor.js');

cron.schedule('0 21 * * *', async () => {
  console.log('Running daily 9 PM IST due-task check...');
  try {
    const processedCount = await processPastDueTasks();
    console.log(`${processedCount} due tasks processed automatically.`);
  } catch (error) {
    console.error('Error processing due tasks automatically:', error);
  }
}, { timezone: 'Asia/Kolkata' });
