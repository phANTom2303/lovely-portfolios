import { query } from "#src/config/db.js";
import * as linkRepo from "#repositories/links.repo.js";
export const getAllLinks = async () => {
    const result = await linkRepo.findAll();
    return result;
};

export const createLink = async (link, title, description) => {
    const createdLink = await linkRepo.create(link, title, description);
    
    return createdLink;
};