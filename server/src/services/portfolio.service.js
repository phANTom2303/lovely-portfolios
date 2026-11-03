import * as portfolioRepo from "#repositories/portfolio.repo.js";
import { NotFoundError } from "#src/lib/errors.js";

export const getPortfolio = async (user_id, portfolio_id) => {
    if (portfolio_id === undefined) {
        const result = await portfolioRepo.getAllPortfolios(user_id);
        return result;
    } else {
        const result = await portfolioRepo.getPortfolioById(portfolio_id);
        return result;
    }
};

export const getPortfolioPublic = async (portfolio_id) => {
    const result = await portfolioRepo.getPortfolioById(portfolio_id);
    if (!result) throw new NotFoundError(`Portfolio with id "${portfolio_id}" not found`);
    return result;
};

export const createPortfolio = async (user_id, user_email, portfolio_name, profile_data) => {
    const created = await portfolioRepo.makePortfolio(user_id, user_email, portfolio_name, profile_data);
    return created;
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