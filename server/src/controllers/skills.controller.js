import asyncHandler from "#src/lib/asyncHandler.js";
import { RESPONSE_CODES } from "#src/lib/common.js";
import * as skilsService from '#services/skils.service.js'

export const getAllSkilss = asyncHandler(async (req, res) => {
    const skills = await skilsService.getAllskills();
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: skills.length,
        data: skills
    });
});