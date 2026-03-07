import express from 'express';
import userController from '../controllers/user.controller.js';
import reminderController from '../controllers/reminder.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Auth Routes (Public)
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);

// User Routes (Protected)
router.get('/users/me', authMiddleware, userController.getProfile);
router.put('/users/me', authMiddleware, userController.updateProfile);

// Reminder Routes (Protected)
router.get('/reminders', authMiddleware, reminderController.getAll); 
router.post('/reminders', authMiddleware, reminderController.create);
router.put('/reminders/:id', authMiddleware, reminderController.update);
router.delete('/reminders/:id', authMiddleware, reminderController.delete);
router.post('/reminders/:id/complete', authMiddleware, reminderController.markCompleted);

export default router;