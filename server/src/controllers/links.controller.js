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

export const deleteLink = asyncHandler(async (req, res) => {
    const { link_id } = req.body;
    if (!link_id) return res.status(400).json({
        success: false,
        message: "Please provide link_id",
    });

    const deleted = await linkService.deleteLink(link_id);

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    })
});

export const updateLink = asyncHandler(async (req, res) => {
    const { link_id, title, link, description } = req.body;

    if (!link_id) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "Please Provide link_id",
    });

    if (!title && !link && !description) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "Please Provide at least one parameter",
    });

    const updated = await linkService.updateLink(link_id, {
        title,
        link,
        description,
    });

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updated,
    });
});