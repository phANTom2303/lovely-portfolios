import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as linkController from "#controllers/links.controller.js"
const router = Router();

router.use(userLoggedIn);

router.get('/', linkController.getAllLinks);

router.get('/params', linkController.getLinksByParams);

router.post('/', linkController.createLink);

router.delete('/', linkController.deleteLink);

router.patch('/', linkController.updateLink);

export default router;