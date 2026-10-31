import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as reController from "#controllers/re.controller.js";

const router = Router();

// router.use(userLoggedIn);

router.use((req, res, next) => {
  req.user = req.user || {};
  req.user.id = "550e8400-e29b-41d4-a716-446655440000";
  next();
});

router.get('/', reController.getRE);

router.post('/', reController.createRE);

router.delete('/', reController.deleteRE);

router.patch('/', reController.updateRE);

export default router;