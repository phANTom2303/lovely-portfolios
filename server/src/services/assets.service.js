import { query } from "#src/config/db.js";
import * as assetRepo from "#repositories/assets.repo.js";
import { NotFoundError } from "#src/lib/errors.js";
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
export const deleteAsset = async (id) => {
  const deleted = await assetRepo.remove(id);
  if (!deleted) throw new NotFoundError(`Link with id "${id}" not found`);
  return deleted;
};

export const updateAsset = async (user_id, id, fields) => {
  const updated = await assetRepo.update(user_id, id, fields);
  if (!updated) throw new NotFoundError(`Link with id "${id}" not found`);
  return updated;
};
