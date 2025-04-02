import express from "express";
import { insertHeader, updateHeader, getHeaderByName, headersWithMessages } from "../controllers/headerController.js";

const router = express.Router();

router.post("/headers", insertHeader);
router.put("/headers/:name", updateHeader);
router.get("/headers/:name", getHeaderByName);
router.get("/headersWithMessages/:name", headersWithMessages);

export default router;
