import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as reController from "#controllers/re.controller.js";

const router = Router();

router.use(userLoggedIn);

router.get('/', reController.getRE);

router.post('/', reController.createRE);

router.delete('/', reController.deleteRE);

router.patch('/', reController.updateRE);

export default router;