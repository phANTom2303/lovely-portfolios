import {Router} from "express";
import {query} from "#src/config/db.js";
import * as educationController from "#controller/education.controller.js";
const router = Router();

router.get('/', educationController.getEducation);

router.post('/', educationController.createEducation);

router.delete('/', educationController.deleteEducation);

router.patch('/', educationController.updateEducation);

export default router;