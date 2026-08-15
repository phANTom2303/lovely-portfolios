import { Router } from "express";
import { query } from "#src/config/db.js";
import * as linkController from "#controllers/links.controller.js"
const router = Router();

router.get('/', linkController.getAllLinks);

router.get('/params', linkController.getLinksByParams);

router.post('/', linkController.createLink);

router.delete('/', linkController.deleteLink);

router.patch('/', linkController.updateLink);

export default router;