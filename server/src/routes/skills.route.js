import { Router } from "express";
import * as skillsControlelr from "#controllers/skills.controller.js"
const router = Router();

router.get('/', skillsControlelr.getAllSkilss);

export default router;