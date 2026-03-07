import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const authService = {
    register: async (username, password, gmail) => {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        return userModel.registerByTransaction(username, gmail, passwordHash);
    },

    login: async (loginInput, password) => {
        const user = await userModel.findByEmailOrUsername(loginInput);

        const isMatch =
        user && await bcrypt.compare(password, user.password);

        if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
        }
        
        // Hard fail if secret is missing (Safety)
        if (!process.env.JWT_SECRET) {
            throw new Error("Server Error: JWT_SECRET is not defined");
        }

        const payload = {
            userId: user.user_id,
            role: user.role,
            gmail: user.gmail
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // Don't return password
        const { password: _, ...userInfo } = user; 
        
        return {
            user: userInfo,
            accessToken
        };
    }
};

export default authService;