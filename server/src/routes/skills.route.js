import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as skillsControlelr from "#controllers/skills.controller.js"
const router = Router();

router.use(userLoggedIn);

router.get('/', skillsControlelr.getAllSkilss);
router.post('/', skillsControlelr.createSkill);

export default router;