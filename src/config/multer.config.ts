import multer from "multer";
import path from "path";

// إعدادات الذاكرة المؤقتة
const storage = multer.memoryStorage();

// فلترة أنواع الملفات المسموحة
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // الصور المسموحة
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  // المستندات المسموحة
  const allowedDocTypes = /pdf|doc|docx|txt/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith("image/");
  const isDoc = allowedDocTypes.test(extname);

  if (isImage || isDoc) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and documents are allowed."));
  }
};

// إعدادات Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Middleware لرفع ملف واحد
export const uploadSingle = upload.single("file");

// Middleware لرفع عدة ملفات
export const uploadMultiple = upload.array("files", 5); // max 5 files

// Middleware لرفع حقول متعددة
export const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]);