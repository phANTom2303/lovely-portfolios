import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as skillsController from "#controllers/skills.controller.js";

const router = Router();

router.use(userLoggedIn);

// GET all skills (admin/debug)
router.get('/', skillsController.getAllSkills);

// GET scoped skills: omit re_id for profile-level, add ?re_id=<n> for RE-level
router.get('/params', skillsController.getSkillsByParams);

// POST create a skill (profile or RE-level based on body.re_id)
router.post('/', skillsController.createSkill);

// DELETE a skill by ?skill_id=<n>
router.delete('/', skillsController.deleteSkill);

// PATCH update a skill's name
router.patch('/', skillsController.updateSkill);

export default router;
