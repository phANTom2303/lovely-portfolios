import { query } from "#src/config/db.js";
import * as assetRepo from "#repositories/assets.repo.js";
import { NotFoundError } from "#src/lib/errors.js";
import { deleteImage, uploadImage } from "#src/lib/cloudinary.js";

export const getAllAssets = async () => {
    const result = await assetRepo.findAll();
    return result;
};

export const getAssetsByParams = async (user_id, re_id) => {
    if (re_id !== undefined) {
        const result = await assetRepo.getResumeEntityAssets(user_id, re_id);
        return result;
    }
    else {
        console.log("Enter both user id and re id");
    }
}
export const createAsset = async (user_id, re_id, title, link, description, asset_type) => {
    const createdAsset = await assetRepo.create(user_id, re_id, title, link, description, asset_type);
    return createdAsset;
};

export const createImageAsset = async (user_id, re_id, title, description, imageBuffer) => {
    const imageDetails = await uploadImage(imageBuffer);

    const cloudinary_public_id = imageDetails.public_id;

    const link = imageDetails.secure_url;

    const result = await assetRepo.createImage(user_id, re_id, title, description, 'image', cloudinary_public_id, link);

    return result;
}

export const deleteAsset = async (id) => {
    const deleted = await assetRepo.remove(id);

    if (!deleted) throw new NotFoundError(`Asset with id "${id}" not found`);

    const cloudinary_public_id = deleted.cloudinary_public_id;

    if (cloudinary_public_id !== undefined && cloudinary_public_id !== null) {
        await deleteImage(cloudinary_public_id);
    }
    
    return deleted;
};

export const updateAsset = async (user_id, id, fields) => {
    const updated = await assetRepo.update(user_id, id, fields);
    if (!updated) throw new NotFoundError(`Link with id "${id}" not found`);
    return updated;
};
