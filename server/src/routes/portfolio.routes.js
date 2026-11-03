import { Router } from "express";
import { userLoggedIn } from "#middlewares/auth.middleware.js";
import * as portfolioController from "#controllers/portfolio.controller.js";

const router = Router();

// Public route — no auth required
router.get('/public/:portfolio_id', portfolioController.getPortfolioPublic);

// Private routes — auth required
router.use(userLoggedIn);

router.get('/', portfolioController.getPortfolio);

router.post('/', portfolioController.createPortfolio);

router.post('/generate', portfolioController.generatePortfolio);

router.delete('/', portfolioController.deletePortfolio);

router.patch('/', portfolioController.updatePortfolio);

export default router;
