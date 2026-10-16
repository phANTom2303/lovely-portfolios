import * as skillsRepo from '#repositories/skills.repo.js'

export const getAllskills = async () => {
    const result = await skillsRepo.getAll();
    return result;
}

export const createSkill = async (skill_name) => {
    const result = await skillsRepo.createSkill(skill_name);
    return result;
}