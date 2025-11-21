import { Router } from "express";
import { uploadSingleFile, uploadMultipleFiles, deleteFile } from "./upload.controller";
import { uploadSingle, uploadMultiple } from "../../config/multer.config";
import { protect } from "../auth/auth.middleware";

const router = Router();

// رفع ملف واحد
router.post("/single", protect, uploadSingle, uploadSingleFile);

// رفع عدة ملفات
router.post("/multiple", protect, uploadMultiple, uploadMultipleFiles);

// حذف ملف
router.delete("/", protect, deleteFile);

export default router;