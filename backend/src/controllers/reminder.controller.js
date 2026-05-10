import reminderService from '../services/reminder.service.js';

const reminderController = {
    // POST /reminders
    create: async (req, res, next) => {
        try {
            const userId = Number(req.user.user_id);
            const { title, content, shown_at } = req.body;

            const result = await reminderService.createReminder(
                { title, content, shown_at }, 
                userId
            );

            res.status(201).json({
                message: "Reminder created successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const userId = Number(req.user.user_id);
            
            // Gọi sang service để lấy data 
            const reminders = await reminderService.getReminders(userId);

            // Trả về data đúng format mà Frontend đang đợi
            res.status(200).json(reminders);
        } catch (error) {
            next(error);
        }
    },
    // PUT /reminders/:id
    update: async (req, res, next) => {
        try {
            const userId = Number(req.user.user_id);
            const reminderId = Number(req.params.id);
            const updates = req.body;

            await reminderService.updateReminder(reminderId, userId, updates);

            res.status(200).json({
                message: "Reminder updated successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /reminders/:id
    delete: async (req, res, next) => {
        try {
            
            const userId = Number(req.user.user_id);
            const reminderId = Number(req.params.id);
            

            await reminderService.deleteReminder(reminderId, userId);

            res.status(200).json({
                message: "Reminder deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /reminders/:id/complete
    markCompleted: async (req, res, next) => {
        try {
            const userId = Number(req.user.user_id);
            const reminderId = Number(req.params.id);


            await reminderService.markCompleted(reminderId, userId);

            res.status(200).json({
                message: "Reminder marked as completed"
            });
        } catch (error) {
            next(error);
        }
    }
};

export default reminderController;