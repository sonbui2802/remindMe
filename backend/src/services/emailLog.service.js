import emailLogModel from "../models/emaillog.model.js";
import { transporter } from "../config/mail.config.js";

const emailLogService = {
    processBatch: async () => {
        try {
            const emails = await emailLogModel.claimPendingEmails(10);
            
            if (!emails || emails.length === 0) return;

            console.log(`[Worker] Processing ${emails.length} emails...`);
            
            // ✅ FIX LỖI GỬI ĐÚP: Chỉ dùng 1 vòng lặp tuần tự (Xóa dòng map song song)
            for (const email of emails) {
                await emailLogService.sendSingleEmail(email);
            }

            console.log(`[Worker] Batch complete.`);
        } catch (error) {
            console.error(`[Worker Error] Batch failed:`, error);
        }
    },

    sendSingleEmail: async (email) => {
        try {
            await transporter.sendMail({
                from: `"RemindMe App" <${process.env.EMAIL_USER}>`,
                to: email.recipient_email,
                subject: email.subject,
                text: email.content,
            });

            console.log(`[Sent] 📩 ID ${email.email_id} -> ${email.recipient_email}`);
            await emailLogModel.updateStatus(email.email_id, 'sent');

        } catch (err) {
            console.error(`[Failed] ❌ ID ${email.email_id}: ${err.message}`);
            await emailLogModel.updateStatus(email.email_id, 'failed');
        }
    }
};

export default emailLogService;