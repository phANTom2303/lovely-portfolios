import { query } from "#src/config/db.js";
import * as assetRepo from "#repositories/assets.repo.js";
import { NotFoundError } from "#src/lib/errors.js";
export const getAllAssets = async () => {
  const result = await assetRepo.findAll();
  return result;
};

export const createAsset = async (title, link, description, asset_type) => {
  const createdAsset = await assetRepo.create(title, link, description, asset_type);
  return createdAsset;
};
export const deleteAsset = async (id) => {
  const deleted = assetRepo.remove(id);
  if (!deleted) throw new NotFoundError(`Link with id "${id}" not found`);
  return deleted;
};

export const updateAsset = async (id, fields) => {
  const updated = await assetRepo.update(id, fields);
  if (!updated) throw new NotFoundError(`Link with id "${id}" not found`);
  return updated;
};
