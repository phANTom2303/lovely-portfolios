import axios from "axios";
import * as portfolioRepo from "#repositories/portfolio.repo.js";
import { AppError, NotFoundError } from "#src/lib/errors.js";
import { RESPONSE_CODES } from "#src/lib/common.js";

const AI_PIPELINE_URL = process.env.AI_PIPELINE_URL || 'http://localhost:8000';

export const getPortfolio = async (user_id, portfolio_id) => {
    if (portfolio_id === undefined) {
        const result = await portfolioRepo.getAllPortfolios(user_id);
        return result;
    } else {
        const result = await portfolioRepo.getPortfolioById(portfolio_id);
        // Another user's portfolio is reported as not found so its existence is not revealed
        if (!result || result.user_id !== user_id) throw new NotFoundError(`Portfolio with id "${portfolio_id}" not found`);
        return result;
    }
};

export const getPortfolioPublic = async (portfolio_id) => {
    const result = await portfolioRepo.getPortfolioById(portfolio_id);
    // Draft and archived portfolios are reported as not found so their existence is not revealed
    if (!result || result.status !== "published") throw new NotFoundError(`Portfolio with id "${portfolio_id}" not found`);
    return result;
};

export const createPortfolio = async (user_id, user_email, portfolio_name, profile_data) => {
    const created = await portfolioRepo.makePortfolio(user_id, user_email, portfolio_name, profile_data);
    return created;
};

export const generatePortfolio = async (user_id, jd_text) => {
    let generated;
    try {
        const { data } = await axios.post(`${AI_PIPELINE_URL}/api/generate-portfolio`, { user_id, jd_text });
        generated = data;
    } catch (err) {
        // AI pipeline responded with an error — forward its status and message
        if (err.response) {
            throw new AppError(err.response.data?.detail || "AI pipeline failed to generate the portfolio", err.response.status);
        }
        // AI pipeline could not be reached
        throw new AppError("The AI service is unavailable. Please try again later.", RESPONSE_CODES.SERVICE_UNAVAILABLE_CODE);
    }

    // AI pipeline writes to the DB directly, so the cached portfolio list is now stale
    await portfolioRepo.clearUserPortfoliosCache(user_id);
    return generated;
};

export const deletePortfolio = async (user_id, portfolio_id) => {
    const deleted = await portfolioRepo.removePortfolio(user_id, portfolio_id);
    if (!deleted) throw new NotFoundError(`Portfolio with id "${portfolio_id}" or user_id "${user_id}" not found`);
    return deleted;
};

export const updatePortfolio = async (user_id, portfolio_id, fields) => {
    const updated = await portfolioRepo.update(user_id, portfolio_id, fields);
    if (!updated) throw new NotFoundError(`Portfolio with id "${portfolio_id}" or user_id "${user_id}" not found`);
    return updated;
};
