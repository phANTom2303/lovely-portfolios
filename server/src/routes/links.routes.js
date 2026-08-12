import { Router } from "express";
import { query } from "#src/config/db.js";
import * as linkController from "#controllers/links.controller.js"
const router = Router();

router.get('/', linkController.getAllLinks);

router.post('/', async (req, res) => {
    const { link, title, description } = req.body;

    if (!link || !title) return res.status(400).json("both URL and Title required");

    const params = [link, title, description];

    const result = await query(`INSERT INTO links (link, title, description) VALUES ($1, $2, $3)`, params);

    return res.json("created");
});

export default router;