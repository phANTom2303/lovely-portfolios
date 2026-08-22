import asyncHandler from "#src/lib/asyncHandler.js";
import * as educationService from "#services/education.services.js";
import { RESPONSE_CODES } from "#src/lib/common.js";

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validEducationTypes = [
    "secondary",
    "higher_secondary",
    "under_graduate",
    "post_graduate",
    "diploma",
    "phd",
];

const validMarksTypes = ["percentage", "gpa"];

//GET EDUCATION
export const getEducation = asyncHandler(async (req, res) => {
    const { user_id, edu_id } = req.body;

    if (!user_id) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id is mandatory",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    const education = await educationService.getEducation(user_id, edu_id);
    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        count: Array.isArray(education) ? education.length : (education ? 1 : 0),
        data: education,
    });
});

//POST EDUCATION
export const createEducation = asyncHandler(async (req, res) => {
    const {
        user_id,
        education_type,
        start_date,
        end_date,
        marks,
        marks_type,
        total_mark,
        institute_name,
        stream,
    } = req.body;

    if (
        user_id === undefined ||
        education_type === undefined ||
        start_date === undefined ||
        end_date === undefined ||
        marks === undefined ||
        marks_type === undefined ||
        total_mark === undefined ||
        institute_name === undefined
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "All education fields are mandatory",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    if (
        typeof education_type !== "string" ||
        !validEducationTypes.includes(education_type)
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid education_type",
        });
    }

    if (typeof marks_type !== "string" || !validMarksTypes.includes(marks_type)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid marks_type",
        });
    }

    if (typeof institute_name !== "string" || institute_name.trim() === "") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "institute_name must be a non-empty string",
        });
    }

    if (stream !== undefined && stream !== null && typeof stream !== "string") {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "stream must be a string",
        });
    }

    const parsedStart = new Date(start_date);
    const parsedEnd = new Date(end_date);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "start_date and end_date must be valid dates",
        });
    }

    if (parsedStart > parsedEnd) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "start_date cannot be after end_date",
        });
    }

   if (
        typeof marks !== "number" ||
        typeof total_mark !== "number" ||
        !Number.isFinite(marks) ||
        !Number.isFinite(total_mark)
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "marks and total_mark must be valid numbers",
        });
    }

    if (marks < 0 || total_mark <= 0 || marks > total_mark) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message:
                "marks must be between 0 and total_mark, and total_mark must be greater than 0",
        });
    }

    const createdEducation = await educationService.createEducation(
        user_id,
        education_type,
        start_date,
        end_date,
        marks,
        marks_type,
        total_mark,
        institute_name,
        stream
    );

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: createdEducation,
    });
});

export const deleteEducation = asyncHandler(async (req,res) => {
    const {user_id,edu_id} = req.body;

    if(!user_id || !edu_id){
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide both user_id and edu_id",
        });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    const eduIdNum = Number(edu_id);
    if (!Number.isInteger(eduIdNum) || eduIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "edu_id must be a positive integer",
        });
    }

    const deleted = await educationService.deleteEducation(user_id,eduIdNum);

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: deleted,
    });
});

export const updateEducation = asyncHandler(async (req,res) => {

    const {
        edu_id,
        user_id,
        education_type,
        start_date,
        end_date,
        marks,
        marks_type,
        total_mark,
        institute_name,
        stream,
    } = req.body;

    if (user_id === undefined || edu_id === undefined) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "user_id and edu_id are mandatory",
        });
    }   

    if (
        education_type === undefined &&
        start_date === undefined &&
        end_date === undefined &&
        marks === undefined &&
        marks_type === undefined &&
        total_mark === undefined &&
        institute_name === undefined &&
        stream === undefined
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Please provide at least one field to update",
        });
    }

    const eduIdNum = Number(edu_id);
    if (!Number.isInteger(eduIdNum) || eduIdNum <= 0) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
        success: false,
        message: "edu_id must be a positive integer",
    });
    }

    if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid user_id",
        });
    }

    if (
        education_type !== undefined &&
        (
            typeof education_type !== "string" ||
            !validEducationTypes.includes(education_type)
        )
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid education_type",
        });
    }

    if (
        marks_type !== undefined &&
        (
            typeof marks_type !== "string" ||
            !validMarksTypes.includes(marks_type)
        )
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "Invalid marks_type",
        });
    }

    if (
        institute_name !== undefined &&
        (
            typeof institute_name !== "string" ||
            institute_name.trim() === ""
        )
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "institute_name must be a non-empty string",
        });
    }

    if (
        stream !== undefined &&
        stream !== null &&
        typeof stream !== "string"
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "stream must be a string",
        });
    }
    
    if (start_date !== undefined || end_date !== undefined) {

        if (start_date === undefined || end_date === undefined) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "Both start_date and end_date must be provided together",
            });
        }

        const parsedStart = new Date(start_date);
        const parsedEnd = new Date(end_date);

        if (
            isNaN(parsedStart.getTime()) ||
            isNaN(parsedEnd.getTime())
        ) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "start_date and end_date must be valid dates",
            });
        }

        if (parsedStart > parsedEnd) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "start_date cannot be after end_date",
            });
        }
    }

   if (marks !== undefined) {
        if (
            typeof marks !== "number" ||
            !Number.isFinite(marks)
        ) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "marks must be a valid number",
            });
        }
    }

    if (total_mark !== undefined) {
        if (
            typeof total_mark !== "number" ||
            !Number.isFinite(total_mark) ||
            total_mark <= 0
        ) {
            return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
                success: false,
                message: "total_mark must be a valid number greater than 0",
            });
        }
    }

    if (
        marks !== undefined &&
        total_mark !== undefined &&
        marks > total_mark
    ) {
        return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
            success: false,
            message: "marks cannot be greater than total_mark",
        });
    }
   
    const updatedEducation = await educationService.updateEducation(
        user_id,
        eduIdNum,
        {
            education_type,
            start_date,
            end_date,
            marks,
            marks_type,
            total_mark,
            institute_name,
            stream,
        }
    );

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
        success: true,
        data: updatedEducation,
    });
});