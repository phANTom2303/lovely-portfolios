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

export const getLinksByParams = asyncHandler(async (req, res) => {
    const { user_id, re_id } = req.body;

    if (user_id !== undefined) {
        const links = await linkService.getLinksByParams(user_id, re_id);
        res.status(RESPONSE_CODES.SUCCESS_CODE).json({
            success: true,
            count: links.length,
            data: links,
        });
    } else {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory, add re_id for resume entity links"
        });
    }
});

export const createLink = asyncHandler(async (req, res) => {
    const { user_id, re_id, link, title, description } = req.body;
    if (!user_id) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "user_id field is mandatory"
    });

    if (!link || !title) return res.status(400).json("both URL and Title required");

    let createdLink;
    if (!re_id) {
        createdLink = await linkService.createProfileLink(user_id, link, title, description);

    } else {
        createdLink = await linkService.createRELink(user_id, re_id, link, title, description);

    }

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        succss: true,
        data: createdLink,
    });
});

export const deleteLink = asyncHandler(async (req, res) => {
    const { user_id, link_id } = req.body;
    if (!link_id || !user_id) return res.status(400).json({
        success: false,
        message: "Please provide both user_id and link_id",
    });

    const deleted = await linkService.deleteLink(user_id, link_id);

    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    })
});

export const updateLink = asyncHandler(async (req, res) => {
    const { user_id, link_id, title, link, description } = req.body;

    if (!link_id || !user_id) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "Please Provide both user_id and link_id",
    });

    if (!title && !link && !description) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "Please Provide at least one parameter",
    });

    const updated = await linkService.updateLink(user_id, link_id, {
        title,
        link,
        description,
    });

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updated,
    });
});