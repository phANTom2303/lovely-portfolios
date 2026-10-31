import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as skillsController from "#controllers/skills.controller.js";

const router = Router();

// router.use(userLoggedIn);

router.use((req, res, next) => {
  req.user = req.user || {};
  req.user.id = "550e8400-e29b-41d4-a716-446655440000";
  next();
});


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
