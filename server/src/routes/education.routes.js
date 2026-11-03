import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as educationController from "#controllers/education.controller.js";
const router = Router();

router.use(userLoggedIn);

router.get('/', educationController.getEducation);

router.post('/', educationController.createEducation);

router.delete('/', educationController.deleteEducation);

router.patch('/', educationController.updateEducation);

export default router;