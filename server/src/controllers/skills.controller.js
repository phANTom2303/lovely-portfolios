import asyncHandler from "#src/lib/asyncHandler.js";
import { RESPONSE_CODES } from "#src/lib/common.js";
import * as skilsService from '#services/skils.service.js'
import { success } from "zod";

export const getAllSkilss = asyncHandler(async (req, res) => {
    const skills = await skilsService.getAllskills();
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: skills.length,
        data: skills
    });
});

export const createSkill = asyncHandler(async (req, res) => {
    const { skill_name } = req.body;
    if (!skill_name) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "Please provide a value for skill_name"
    });

    const createdSkill = await skilsService.createSkill(skill_name);

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: createdSkill
    });
});