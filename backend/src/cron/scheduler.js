import cron from 'node-cron';
import reminderService from '../services/reminder.service.js';
import emailLogService from '../services/emailLog.service.js';

// Simple mutex flags to prevent overlapping runs (if a job takes > 1 min)
let isScannerRunning = false;
let isSenderRunning = false;

const scheduler = {
    init: () => {
        console.log('[Cron] Initializing background jobs...');

        // JOB 1: Scanner (Every minute)
        // Finds due reminders in 'reminder' table -> Creates records in 'emaillog'
        cron.schedule('* * * * *', async () => {
            if (isScannerRunning) {
                console.log('[Cron] Scanner still running, skipping this tick.');
                return;
            }
            
            isScannerRunning = true;
            try {
                // The Service handles the Transaction & Locking
                await reminderService.scanAndSchedule();
            } catch (error) {
                console.error('[Cron] Scanner failed:', error.message);
            } finally {
                isScannerRunning = false;
            }
        });

        // JOB 2: Sender (Every 30 seconds)
        // Picks up 'pending' emails from 'emaillog' -> Sends via SMTP
        cron.schedule('*/30 * * * * *', async () => {
            if (isSenderRunning) {
                console.log('[Cron] Sender still running, skipping this tick.');
                return;
            }

            isSenderRunning = true;
            try {
                // The Service handles the Batching & Sending
                await emailLogService.processBatch();
            } catch (error) {
                console.error('[Cron] Sender failed:', error.message);
            } finally {
                isSenderRunning = false;
            }
        });

        console.log('[Cron] Jobs scheduled successfully.');
    }
};

export default scheduler;