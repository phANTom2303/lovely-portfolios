import asyncHandler from '#lib/asyncHandler.js';
import * as authService from '#services/auth.service.js';
import * as userRepo from '#repositories/user.repo.js';
import { RESPONSE_CODES } from '#lib/common.js';
import { NotFoundError } from '#lib/errors.js';

export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, phone_no } = req.body;
    const result = await authService.signup({ name, email, password, phone_no });

    res.status(RESPONSE_CODES.CREATED_CODE).json({
        success: true,
        message: 'Account created successfully',
        data: result,
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
    });
});

export const logout = asyncHandler(async (req, res) => {
    await authService.logout({ token: req.token });

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        message: 'Logged out successfully',
    });
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
        throw new NotFoundError('User profile not found');
    }

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: user,
    });
});
