import express from "express";
import { createUser, getUserDetails } from "../controllers/userController.js";

const router = express.Router();

router.post("/users", createUser);
router.get("/userLogin", getUserDetails);

export default router;
