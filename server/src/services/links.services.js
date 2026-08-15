import { query } from "#src/config/db.js";
import * as linkRepo from "#repositories/links.repo.js";
import { NotFoundError } from "#src/lib/errors.js";
export const getAllLinks = async () => {
    const result = await linkRepo.findAll();
    return result;
};


export const getLinksByParams = async (user_id, re_id) => {
    if (re_id === undefined) {
        const result = await linkRepo.getProfileLinks(user_id);
        return result;
    } else {
        const result = await linkRepo.getResumeEntityLinks(user_id, re_id);
        return result;
    }
};

export const createProfileLink = async (user_id, link, title, description) => {
    const createdLink = await linkRepo.createProfileLink(user_id, link, title, description);
    return createdLink;
};

export const createRELink = async (user_id, re_id, link, title, description) => {
    return await linkRepo.createRElink(user_id, re_id, link, title, description);
}

export const deleteLink = async (id) => {
    const deleted = await linkRepo.remove(id);

    if (!deleted) throw new NotFoundError(`Link with id "${id}" not found`);

    return deleted;
}

export const updateLink = async (user_id, link_id, fields) => {
    const updated = await linkRepo.update(user_id, link_id, fields);

    if (!updated) throw new NotFoundError(`Link with id "${id}" not found`);

    return updated;
};