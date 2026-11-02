import * as skillsRepo from '#repositories/skills.repo.js';
import { NotFoundError } from '#src/lib/errors.js';

/**
 * Return every skill row (admin/debug).
 */
export const getAllSkills = async () => {
    return await skillsRepo.findAll();
};

/**
 * Return skills for a user, filtered by scope:
 *   - re_id undefined  → profile-level skills (re_id IS NULL)
 *   - re_id provided   → skills for that resume entity
 */
export const getSkillsByParams = async (user_id, re_id) => {
    if (re_id === undefined) {
        return await skillsRepo.getProfileSkills(user_id);
    }
    return await skillsRepo.getResumeEntitySkills(user_id, re_id);
};

/**
 * Create a profile-level skill (re_id = null).
 */
export const createProfileSkill = async (user_id, skill_name) => {
    return await skillsRepo.createSkill(user_id, skill_name, null);
};

/**
 * Create a skill tied to a resume entity.
 */
export const createRESkill = async (user_id, re_id, skill_name) => {
    return await skillsRepo.createSkill(user_id, skill_name, re_id);
};

/**
 * Delete a skill, verifying ownership.
 */
export const deleteSkill = async (user_id, skill_id) => {
    const deleted = await skillsRepo.remove(user_id, skill_id);
    if (!deleted) {
        throw new NotFoundError(`Skill with id "${skill_id}" not found for user "${user_id}"`);
    }
    return deleted;
};

/**
 * Update a skill's name, verifying ownership.
 */
export const updateSkill = async (user_id, skill_id, skill_name) => {
    const updated = await skillsRepo.update(user_id, skill_id, skill_name);
    if (!updated) {
        throw new NotFoundError(`Skill with id "${skill_id}" not found for user "${user_id}"`);
    }
    return updated;
};
