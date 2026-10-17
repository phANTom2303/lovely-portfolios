import { Router } from "express";
import * as assetController from "#controllers/assets.controller.js"
import multer from "multer";
const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10
  }
});

const assetParser = upload.fields([{ name: 'assets' }]);

router.get('/', assetController.getAllAssets);

router.get('/params', assetController.getAssetsByParams);

router.post('/', assetController.createAsset);

router.post('/image', assetParser, assetController.createImageAsset)

router.delete('/', assetController.deleteAsset);

router.patch('/', assetController.updateAsset);
export default router;
