import { Router } from "express";
import { toggleLike, getLikesCount, getLikes } from "./like.controller";
import { protect } from "../auth/auth.middleware";

const router = Router();

router.post("/toggle", protect, toggleLike);
router.get("/count", protect, getLikesCount);
router.get("/", protect, getLikes);

export default router;

