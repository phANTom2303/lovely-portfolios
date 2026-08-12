import asyncHandler from "#src/lib/asyncHandler.js";
import * as linkService from "#services/links.services.js"
import { RESPONSE_CODES } from "#src/lib/common.js";

export const getAllLinks = asyncHandler(async (req, res) => {
    const links = await linkService.getAllLinks();
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: links.length,
        data: links,
    })
});

export const createLink = asyncHandler(async (req, res) => {
    const { link, title, description } = req.body;

    if (!link || !title) return res.status(400).json("both URL and Title required");

    const createdLink = await linkService.createLink(link, title, description);

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        succss: true,
        data: createdLink,
    });
});