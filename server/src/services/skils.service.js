import * as skillsRepo from '#repositories/skills.repo.js'

export const getAllskills = async () => {
    const result = await skillsRepo.getAll();
    return result;
}