import { Router } from 'express';
import { z } from 'zod';
import { validate } from '#middlewares/validate.js';
import { userLoggedIn } from '#middlewares/auth.middleware.js';
import * as authController from '#controllers/auth.controller.js';

const router = Router();

// ── Zod Schemas ─────────────────────────────────────────────────────

const signupSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(75),
    email: z.string().trim().email('Invalid email address').max(100),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    phone_no: z.string().trim().max(15).optional().nullable(),
});

const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ── Routes ──────────────────────────────────────────────────────────

// Create user account 1st time
router.post('/signup', validate({ body: signupSchema }), authController.signup);

// Validate email & password, issue token
router.post('/login', validate({ body: loginSchema }), authController.login);

// Invalidate token / blacklist in Redis
router.post('/logout', userLoggedIn, authController.logout);

// Get current authenticated user profile
router.get('/me', userLoggedIn, authController.getMe);

export default router;
