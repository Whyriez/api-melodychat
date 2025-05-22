import express from "express";
import { insertMessage, getMessagesByHeader, markMessageAsRead} from "../controllers/messageController.js";
import { searchTrackMusic} from "../controllers/musicController.js";

const router = express.Router();

router.post("/messages", insertMessage);
router.put("/messages/:messageId/read", markMessageAsRead);
router.get("/messages/:headerId", getMessagesByHeader);
router.get("/searchTrack", searchTrackMusic);

export default router;
