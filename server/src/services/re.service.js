import * as reRepo from "#repositories/re.repo.js";
import * as linksService from "#services/links.services.js";
import * as assetsService from "#services/assets.service.js";
import * as skillsService from "#services/skils.service.js";
import { NotFoundError } from "#src/lib/errors.js";

export const getRE = async (user_id, re_id, type) => {
    if (re_id === undefined) {
        return await reRepo.getAllREs(user_id, type);
    } else {
        const reData = await reRepo.getREById(user_id, re_id);
        if (!reData) {
            throw new NotFoundError(`Resume Entity with id "${re_id}" not found`);
        }

        reData.links = await linksService.getLinksByParams(user_id, re_id);
        reData.assets = await assetsService.getAssetsByParams(user_id, re_id);
        reData.skills = await skillsService.getSkillsByParams(user_id, re_id);

        return reData;
    }
};

export const createRE = async (user_id, fields) => {
    if (!fields.re_type || !fields.title) {
        const error = new Error("Resume Entity type and title are required");
        error.statusCode = 400;
        throw error;
    }

    const createdRE = await reRepo.createRE(user_id, fields);

    if (fields.links && fields.links.length > 0) {
        for (const link of fields.links) {
            await linksService.createRELink(
                user_id,
                createdRE.re_id,
                link.url,
                link.title,
                link.description
            );
        }
    }

    if (fields.assets && fields.assets.length > 0) {
        for (const asset of fields.assets) {
            await assetsService.createAsset(
                user_id,
                createdRE.re_id,
                asset.title,
                asset.link,
                asset.description,
                asset.asset_type
            );
        }
    }

    if (fields.skills && fields.skills.length > 0) {
        for (const skill of fields.skills) {
            const skillName = typeof skill === "string" ? skill : skill.skill_name;
            if (skillName) {
                await skillsService.createRESkill(
                    user_id,
                    createdRE.re_id,
                    skillName
                );
            }
        }
    }

    return createdRE;
};

export const deleteRE = async (user_id, re_id) => {
    const deleted = await reRepo.removeRE(user_id, re_id);
    if (!deleted) throw new NotFoundError(`Resume Entity with id "${re_id}" not found`);
    return deleted;
};

export const updateRE = async (user_id, re_id, fields) => {
    const allowedUpdates = {
        title: fields.title,
        subtitle: fields.subtitle,
        description: fields.description,
        from_date: fields.from_date,
        to_date: fields.to_date,
        status: fields.status,
    };

    const updated = await reRepo.updateRE(user_id, re_id, allowedUpdates);
    if (!updated) throw new NotFoundError(`Resume Entity with id "${re_id}" not found`);
    return updated;
};