import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as usersController from "#controllers/user.controller.js";

const router = Router();

router.post('/', usersController.createUser);

router.use(userLoggedIn);

router.get('/me', usersController.getMyProfile);

router.get('/', usersController.getUserByEmail);

router.patch('/', usersController.updateUser);

router.delete('/', usersController.deleteUser);

export default router;