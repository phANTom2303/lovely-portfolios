import asyncHandler from "#src/lib/asyncHandler.js";
import * as portfolioService from "#services/portfolio.service.js";
import { RESPONSE_CODES } from "#src/lib/common.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// GET PORTFOLIO (public — by portfolio_id only)
export const getPortfolioPublic = asyncHandler(async (req, res) => {
    const { portfolio_id } = req.params;

    const portfolioIdNum = Number(portfolio_id);
    if (!Number.isInteger(portfolioIdNum) || portfolioIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "portfolio_id must be a positive integer",
        });
    }

    const portfolio = await portfolioService.getPortfolioPublic(portfolioIdNum);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: portfolio,
    });
});

// GET PORTFOLIO (private — all or by id for authenticated user)
export const getPortfolio = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { portfolio_id } = req.query;

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

    let portfolioIdNum;
    if (portfolio_id !== undefined) {
        portfolioIdNum = Number(portfolio_id);
        if (!Number.isInteger(portfolioIdNum) || portfolioIdNum <= 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "portfolio_id must be a positive integer",
            });
        }
    }

    const portfolio = await portfolioService.getPortfolio(user_id, portfolioIdNum);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: Array.isArray(portfolio) ? portfolio.length : (portfolio ? 1 : 0),
        data: portfolio,
    });
});

// POST PORTFOLIO
export const createPortfolio = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { portfolio_name, profile_data } = req.body;
    const user_email = req.user.email;

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

    if (portfolio_name === undefined || typeof portfolio_name !== "string" || portfolio_name.trim() === "") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "portfolio_name is mandatory and must be a non-empty string",
        });
    }

    if (profile_data !== undefined && profile_data !== null && typeof profile_data !== "object") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "profile_data must be a valid JSON object",
        });
    }

    const created = await portfolioService.createPortfolio(user_id, user_email, portfolio_name.trim(), profile_data);
    return res.status(RESPONSE_CODES.CREATED_CODE).json({
        success: true,
        data: created,
    });
});

// DELETE PORTFOLIO
export const deletePortfolio = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { portfolio_id } = req.query;

    if (!user_id || !portfolio_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide both user_id and portfolio_id",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    const portfolioIdNum = Number(portfolio_id);
    if (!Number.isInteger(portfolioIdNum) || portfolioIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "portfolio_id must be a positive integer",
        });
    }

    const deleted = await portfolioService.deletePortfolio(user_id, portfolioIdNum);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    });
});

// PATCH PORTFOLIO
export const updatePortfolio = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { portfolio_id, portfolio_name, profile_data, user_email } = req.body;

    if (user_id === undefined || portfolio_id === undefined) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id and portfolio_id are mandatory",
        });
    }

    if (
        portfolio_name === undefined &&
        profile_data === undefined &&
        user_email === undefined
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide at least one field to update",
        });
    }

    const portfolioIdNum = Number(portfolio_id);
    if (!Number.isInteger(portfolioIdNum) || portfolioIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "portfolio_id must be a positive integer",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    if (
        portfolio_name !== undefined &&
        (typeof portfolio_name !== "string" || portfolio_name.trim() === "")
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "portfolio_name must be a non-empty string",
        });
    }

    if (
        profile_data !== undefined &&
        profile_data !== null &&
        typeof profile_data !== "object"
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "profile_data must be a valid JSON object",
        });
    }

    if (
        user_email !== undefined &&
        (typeof user_email !== "string" || user_email.trim() === "")
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_email must be a non-empty string",
        });
    }

    const updated = await portfolioService.updatePortfolio(user_id, portfolioIdNum, {
        portfolio_name: portfolio_name?.trim(),
        profile_data,
        user_email: user_email?.trim(),
    });

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updated,
    });
});
