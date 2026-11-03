import asyncHandler from "#src/lib/asyncHandler.js";
import { RESPONSE_CODES } from "#src/lib/common.js";
import * as skillsService from '#services/skils.service.js';

/**
 * GET /skills
 * Returns every skill row (admin / debug).
 */
export const getAllSkills = asyncHandler(async (req, res) => {
    const skills = await skillsService.getAllSkills();
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: skills.length,
        data: skills,
    });
});

/**
 * GET /skills/params?re_id=<number>
 * Omit re_id for profile-level skills; include it for RE-scoped skills.
 */
export const getSkillsByParams = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { re_id } = req.query;

    const skills = await skillsService.getSkillsByParams(user_id, re_id);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: skills.length,
        data: skills,
    });
});

/**
 * POST /skills
 * Body: { skill_name, re_id? }
 * Omit re_id (or set to null/undefined) for a profile-level skill.
 */
export const createSkill = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { skill_name, re_id } = req.body;

    if (!skill_name) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skill_name is required",
        });
    }

    let created;
    if (!re_id) {
        created = await skillsService.createProfileSkill(user_id, skill_name);
    } else {
        created = await skillsService.createRESkill(user_id, re_id, skill_name);
    }

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: created,
    });
});

/**
 * DELETE /skills?skill_id=<number>
 */
export const deleteSkill = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { skill_id } = req.query;

    if (!skill_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skill_id is required",
        });
    }

    const deleted = await skillsService.deleteSkill(user_id, skill_id);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    });
});

/**
 * PATCH /skills
 * Body: { skill_id, skill_name }
 */
export const updateSkill = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { skill_id, skill_name } = req.body;

    if (!skill_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skill_id is required",
        });
    }

    if (!skill_name) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "skill_name is required",
        });
    }

    const updated = await skillsService.updateSkill(user_id, skill_id, skill_name);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updated,
    });
});
