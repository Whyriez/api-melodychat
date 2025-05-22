import express from "express";
import { insertHeader, updateHeader, getHeaderByName, headersWithMessages, updateFcmToken } from "../controllers/headerController.js";

const router = express.Router();

router.post("/headers", insertHeader);
router.put("/headers/:name", updateHeader);
router.post("/headers/update-token", updateFcmToken);
router.get("/headers/:name", getHeaderByName);
router.get("/headersWithMessages/:name", headersWithMessages);

export default router;
