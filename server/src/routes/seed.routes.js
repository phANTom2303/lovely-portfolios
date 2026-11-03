import { Router } from "express";
import * as seedController from "#controllers/seed.controller.js";

// Unprotected, test-only route for seeding a user's resume data.
const router = Router();

router.post('/', seedController.seedUser);

export default router;
