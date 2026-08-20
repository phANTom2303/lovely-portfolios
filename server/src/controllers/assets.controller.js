import asyncHandler from "#src/lib/asyncHandler.js";
import * as assetService from "#service/assets.service.js"
import { RESPONSE_CODES } from "#src/lib/common.js";
import { success } from "zod";

export const getAllAssets = asyncHandler(async (req, res) => {
  const assets = await assetService.getAllAssets();
  res.status(RESPONSE_CODES.SUCCESS_CODE).json({
    success: true,
    count: assets.length,
    data: assets,
  })
});

export const getAssetsByParams = asyncHandler(async (req, res) => {
  const { user_id, re_id } = req.body;
  if (user_id !== undefined) {
    const assets = await assetService.getAssetsByParams(user_id, re_id);
    res.status(RESPONSE_CODES.SUCCESS_CODE).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } else {
    return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
      success: false,
      message: "User_id is mandatory, add re_id for resume entity assets"
    });
  }
})

export const createAsset = asyncHandler(async (req, res) => {
  const { title, link, description, asset_type } = req.body;

  if (!asset_type || !title) return res.status(400).json("both Assets type and Title required");

  const createdasset = await assetService.createAsset(title, link, description, asset_type);

  res.status(RESPONSE_CODES.SUCCESS_CODE).json({
    succss: true,
    data: createdasset,
  });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const { asset_id } = req.body;
  if (!asset_id) return res.status(400).json({
    success: false,
    message: "Please provide asset_id",
  });
  const deleted = await assetService.deleteAsset(asset_id);
  res.status(RESPONSE_CODES.success).json({
    success: true,
    data: deleted,
  })
});

export const updateAsset = asyncHandler(async (req, res) => {
  const { asset_id, title, link, description, asset_type } = req.body;
  if (!asset_id) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
    success: false,
    message: "Please provide asset_id",
  });
  if (!title && !link && !description && !asset_type) return res.status(RESPONSE_CODES.BAD_REQUEST_CODE).json({
    success: false,
    message: "Please Provide at least one parameter",
  });
  const updated = await assetService.updateAsset(asset_id, {
    title, link, description, asset_type,
  });
  return res.status(RESPONSE_CODES.SUCCESS_CODE).json({
    success: true,
    data: updated,
  });
});












