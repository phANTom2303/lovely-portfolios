import { query } from "#src/config/db.js";
import * as educationRepo from "#repositories/education.repo.js";
import { NotFoundError } from "#src/lib/errors.js";

export const getEducation = async (user_id, edu_id) => {
    if(edu_id === undefined){
        const result = await educationRepo.getAllEducation(user_id);
        return result;
    }
    else{
        const result = await educationRepo.getEducationById(user_id, edu_id);
        return result;
    }
};

export const createEducation = async (user_id, education_type, start_date, end_date, marks, marks_type, total_mark, institute_name, stream) => {
    const createdEducation = await educationRepo.makeEducation(user_id, education_type, start_date, end_date, marks, marks_type, total_mark, institute_name, stream);
    return createdEducation;
};

export const deleteEducation = async(user_id,edu_id) => {
    const deleted = await educationRepo.removeEducation(user_id, edu_id);
    if(!deleted) throw new NotFoundError(`Education with id "${edu_id}" or user_id "${user_id}" not found`);
    return deleted;
};

export const updateEducation = async (user_id, edu_id, fields) => {
    const updated = await educationRepo.update(user_id, edu_id, fields);
    if(!updated) throw new NotFoundError(`Education with id "${edu_id}" or user_id "${user_id}" not found`);
    return updated;
};
