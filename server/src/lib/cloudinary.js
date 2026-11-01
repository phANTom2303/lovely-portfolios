import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import {
    BadRequestError,
    NotFoundError,
    InternalServerError,
} from "#lib/errors.js";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} imageBuffer - Buffer from req.files.assets[0].buffer
 * @returns {Promise<{ public_id: string, secure_url: string }>} The uploaded asset's public ID and secure URL
 * @throws {BadRequestError} If no imageBuffer is provided
 * @throws {Error} If the Cloudinary upload stream fails or rejects
 */
export const uploadImage = async (imageBuffer) => {
    if (!imageBuffer) {
        throw new BadRequestError("No image buffer provided for upload");
    }

    const options = {
        asset_folder: "lovely-portfolios",
        format: "avif",
        quality: "auto:good",
        fetch_format: "auto",
        flags: "progressive",
        resource_type: "image",
    };

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                return reject(error);
            }

            if (!result?.public_id || !result?.secure_url) {
                return reject(new InternalServerError("Cloudinary returned an incomplete upload response"));
            }

            resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
            });
        }).end(imageBuffer);
    });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * @param {string} publicId - The Cloudinary public_id of the asset
 * @returns {Promise<{ result: string }>} The Cloudinary deletion response ({ result: 'ok' })
 * @throws {BadRequestError} If publicId is missing
 * @throws {NotFoundError} If the asset is not found on Cloudinary
 * @throws {InternalServerError} If the deletion fails unexpectedly
 */
export const deleteImage = async (publicId) => {
    if (!publicId) {
        throw new BadRequestError("Image public_id is required for deletion");
    }

    const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
    });

    // Cloudinary does not throw when an ID is missing; it resolves with { result: 'not found' }
    if (response.result === "not found") {
        throw new NotFoundError(`Image with public_id "${publicId}" not found`);
    }

    if (response.result !== "ok") {
        throw new InternalServerError("Failed to delete image from Cloudinary");
    }

    return response;
};