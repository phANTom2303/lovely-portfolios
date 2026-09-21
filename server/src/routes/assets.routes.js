import { Router } from "express";
import { query } from "#src/config/db.js";
import * as assetController from "#controllers/assets.controllers.js"
const router = Router();

router.get('/', assetController.getAllAssets);

router.get('/params', assetController.getAssetsByParams);

router.post('/', assetController.createAsset);

router.delete('/', assetController.deleteAsset);

router.patch('/', assetController.updateAsset);
export default router;
