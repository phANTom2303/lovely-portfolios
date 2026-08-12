import { query } from "#src/config/db.js";
import * as linkRepo from "#repositories/links.repo.js";
export const getAllLinks = async () => {
    const result = await linkRepo.findAll();
    return result;
};