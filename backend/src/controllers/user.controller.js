import authService from '../services/auth.service.js';
import userProfileService from '../services/user.service.js'; 

const userController = {
    // POST /auth/register
    register: async (req, res, next) => {
        try {
            const { username, password, gmail } = req.body;
            
            // Controller just passes data, Service handles hashing & transaction
            const result = await authService.register(username, password, gmail);

            res.status(201).json({
                message: "User registered successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /auth/login
    login: async (req, res, next) => {
        try {
            // "loginInput" can be username or gmail
            const { loginInput, password } = req.body;

            const result = await authService.login(loginInput, password);

            res.status(200).json({
                message: "Login successful",
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/me
    getProfile: async (req, res, next) => {
        try {
            // req.user is set by your Auth Middleware (JWT verify)
            const userId = req.user.user_id; 
            const profile = await userProfileService.getProfile(userId);

            res.status(200).json({
                message: "Profile retrieved successfully",
                data: profile
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /users/me
    updateProfile: async (req, res, next) => {
        try {
            const userId = req.user.user_id;
            const updates = req.body; // { avatar_url, weekly_goal }

            await userProfileService.updateProfile(userId, updates);

            res.status(200).json({
                message: "Profile updated successfully"
            });
        } catch (error) {
            next(error);
        }
    }
};

export default userController;