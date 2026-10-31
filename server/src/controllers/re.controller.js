import asyncHandler from "#src/lib/asyncHandler.js";
import * as reService from "#services/re.service.js";
import { RESPONSE_CODES } from "#src/lib/common.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validRETypes = [
    "project",
    "work_exp",
    "certification",
    "achievements",
    "extra_curricular",
    "others",
];

const validStatuses = ["draft", "active", "deleted"];

// GET RESUME ENTITIES
export const getRE = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {re_id, type } = req.query;

    if (!user_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    let reIdNum = undefined;
    if (re_id !== undefined) {
        reIdNum = Number(re_id);
        if (!Number.isInteger(reIdNum) || reIdNum <= 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "re_id must be a positive integer",
            });
        }
    }

    if (type !== undefined && (typeof type !== "string" || !validRETypes.includes(type))) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid type filter",
        });
    }

    const resumeEntities = await reService.getRE(user_id, reIdNum, type);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: Array.isArray(resumeEntities) ? resumeEntities.length : (resumeEntities ? 1 : 0),
        data: resumeEntities,
    });
});

// POST RESUME ENTITY
export const createRE = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {
        re_type,
        title,
        description,
        skills_id,
        from_date,
        to_date,
        links,
        assets
    } = req.body;

    if (user_id === undefined || re_type === undefined || title === undefined) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id, re_type, and title are mandatory fields",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    if (typeof re_type !== "string" || !validRETypes.includes(re_type)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid re_type",
        });
    }

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "title must be a non-empty string",
        });
    }

    if (description !== undefined && typeof description !== "string") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "description must be a string",
        });
    }

    if (skills_id !== undefined && !Array.isArray(skills_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skills_id must be an array of integers",
        });
    }

    // Date validation
    if (from_date !== undefined) {
        const parsedStart = new Date(from_date);
        if (isNaN(parsedStart.getTime())) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "from_date must be a valid date",
            });
        }
    }

    if (to_date !== undefined) {
        const parsedEnd = new Date(to_date);
        if (isNaN(parsedEnd.getTime())) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "to_date must be a valid date",
            });
        }
    }

    if (from_date !== undefined && to_date !== undefined) {
        const parsedStart = new Date(from_date);
        const parsedEnd = new Date(to_date);
        if (parsedStart > parsedEnd) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "from_date cannot be after to_date",
            });
        }
    }

    const createdRE = await reService.createRE(user_id, {
        re_type,
        title,
        description,
        skills_id,
        from_date,
        to_date,
        links,
        assets
    });

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: createdRE,
    });
});

// DELETE RESUME ENTITY
export const deleteRE = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {re_id } = req.query;

    if (!user_id || !re_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide both user_id and re_id",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    const reIdNum = Number(re_id);
    if (!Number.isInteger(reIdNum) || reIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "re_id must be a positive integer",
        });
    }

    const deleted = await reService.deleteRE(user_id, reIdNum);

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    });
});

// UPDATE RESUME ENTITY
export const updateRE = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {
        re_id,
        re_type,
        title,
        description,
        skills_id,
        from_date,
        to_date,
        status
    } = req.body;

    if (user_id === undefined || re_id === undefined) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id and re_id are mandatory",
        });
    }

    if (
        re_type === undefined &&
        title === undefined &&
        description === undefined &&
        skills_id === undefined &&
        from_date === undefined &&
        to_date === undefined &&
        status === undefined
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide at least one field to update",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    const reIdNum = Number(re_id);
    if (!Number.isInteger(reIdNum) || reIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "re_id must be a positive integer",
        });
    }

    if (re_type !== undefined && (typeof re_type !== "string" || !validRETypes.includes(re_type))) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid re_type",
        });
    }

    if (status !== undefined && (typeof status !== "string" || !validStatuses.includes(status))) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid status",
        });
    }

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "title must be a non-empty string",
        });
    }

    if (description !== undefined && typeof description !== "string") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "description must be a string",
        });
    }

    if (skills_id !== undefined && !Array.isArray(skills_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skills_id must be an array of integers",
        });
    }

    if (from_date !== undefined) {
        const parsedStart = new Date(from_date);
        if (isNaN(parsedStart.getTime())) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "from_date must be a valid date",
            });
        }
    }

    if (to_date !== undefined) {
        const parsedEnd = new Date(to_date);
        if (isNaN(parsedEnd.getTime())) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "to_date must be a valid date",
            });
        }
    }

    if (from_date !== undefined && to_date !== undefined) {
        const parsedStart = new Date(from_date);
        const parsedEnd = new Date(to_date);
        if (parsedStart > parsedEnd) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "from_date cannot be after to_date",
            });
        }
    }

    const updatedRE = await reService.updateRE(
        user_id,
        reIdNum,
        {
            re_type,
            title,
            description,
            skills_id,
            from_date,
            to_date,
            status
        }
    );

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updatedRE,
    });
});