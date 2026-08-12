import { query } from "#src/config/db.js";
import * as linkRepo from "#repositories/links.repo.js";
import { NotFoundError } from "#src/lib/errors.js";
export const getAllLinks = async () => {
    const result = await linkRepo.findAll();
    return result;
};

export const createLink = async (link, title, description) => {
    const createdLink = await linkRepo.create(link, title, description);

    return createdLink;
};

export const deleteLink = async (id) => {
    const deleted = await linkRepo.remove(id);

    if (!deleted) throw new NotFoundError(`Link with id "${id}" not found`);

    return deleted;
}

export const updateLink = async (id, fields) => {
    const updated = await linkRepo.update(id, fields);

    if (!updated) throw new NotFoundError(`Link with id "${id}" not found`);

    return updated;
};