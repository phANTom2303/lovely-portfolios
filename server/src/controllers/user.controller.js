import asyncHandler from "#src/lib/asyncHandler.js";
import * as userService from "#services/user.service.js";
import { RESPONSE_CODES } from "#src/lib/common.js";

// Validation Regex Patterns
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/; 

const validGenders = ["male", "female", "other", "prefer_not_to_say"];

//Get by ID
export const getMyProfile = asyncHandler(async (req, res) => {
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory (User must be logged in)",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id format",
        });
    }

    const userProfile = await userService.getUserById(user_id);

    if (!userProfile) {
        return res.status(RESPONSE_CODES.NOT_FOUND_CODE || 404).json({
            success: false,
            message: "User profile not found",
        });
    }

    if (userProfile.password) delete userProfile.password;

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: userProfile,
    });
});

//Get by Email
export const getUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "email query parameter is mandatory",
        });
    }

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid email format",
        });
    }

    const userProfile = await userService.getUserByEmail(email);

    if (!userProfile) {
        return res.status(RESPONSE_CODES.NOT_FOUND_CODE || 404).json({
            success: false,
            message: "User not found",
        });
    }

    if (userProfile.password) delete userProfile.password;

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: userProfile,
    });
});

//Create User
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone_no } = req.body;

    if (name === undefined || email === undefined || password === undefined) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "name, email, and password are mandatory fields",
        });
    }

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "name must be a non-empty string",
        });
    }

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid email format",
        });
    }

    if (typeof password !== "string" || password.trim().length < 6) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "password must be a string of at least 6 characters",
        });
    }

    if (phone_no !== undefined) {
        if (typeof phone_no !== "string" || !phoneRegex.test(phone_no.trim())) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "phone_no must be a valid phone number string",
            });
        }
    }

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
        return res.status(RESPONSE_CODES.CONFLICT_CODE || 409).json({
            success: false,
            message: "User with this email already exists",
        });
    }

    const createdUser = await userService.createUser({
        name,
        email,
        password, 
        phone_no,
    });

    if (createdUser.password) delete createdUser.password;

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: createdUser,
    });
});

//Update user
export const updateUser = asyncHandler(async (req, res) => {
    const user_id = req.user?.id;
    const {
        name,
        phone_no,
        gender,
        profile_photo_link,
        professional_title,
        about,
        current_location        
    } = req.body;

    if (!user_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory (User must be logged in)",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id format",
        });
    }

    if (
        name === undefined &&
        phone_no === undefined &&
        gender === undefined &&
        profile_photo_link === undefined &&
        professional_title === undefined &&
        about === undefined &&
        current_location === undefined
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide at least one field to update",
        });
    }

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "name must be a non-empty string",
        });
    }

    if (phone_no !== undefined && (typeof phone_no !== "string" || !phoneRegex.test(phone_no.trim()))) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "phone_no must be a valid phone number",
        });
    }

    if (gender !== undefined && (typeof gender !== "string" || !validGenders.includes(gender))) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid gender selection",
        });
    }

    const updatedUser = await userService.updateUser(user_id, {
        name,
        phone_no,
        gender,
        profile_photo_link,
        professional_title,
        about,
        current_location
    });

    if (updatedUser?.password) delete updatedUser.password;

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updatedUser,
    });
});

// DELETE user
export const deleteUser = asyncHandler(async (req, res) => {
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory (User must be logged in)",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id format",
        });
    }

    const deletedUser = await userService.deleteUser(user_id);

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deletedUser,
    });
});