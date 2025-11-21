import { Request, Response } from "express";
import { uploadFileToS3, uploadMultipleFilesToS3, deleteFileFromS3 } from "../../services/s3.service";
import { FOLDERS } from "../../config/s3.config";
import { successResponse, errorResponse } from "../../utils/response";

// رفع ملف واحد
export const uploadSingleFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return errorResponse(res, { status: 400, message: "No file uploaded" });
    }

    const folder = (req.query.folder as string) || FOLDERS.DOCUMENTS;
    const result = await uploadFileToS3(req.file, folder);

    return successResponse(res, result, "File uploaded successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// رفع عدة ملفات
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return errorResponse(res, { status: 400, message: "No files uploaded" });
    }

    const folder = (req.query.folder as string) || FOLDERS.DOCUMENTS;
    const files = req.files as Express.Multer.File[];
    const results = await uploadMultipleFilesToS3(files, folder);

    return successResponse(res, results, "Files uploaded successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

// حذف ملف
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;

    if (!key) {
      return errorResponse(res, { status: 400, message: "File key is required" });
    }

    await deleteFileFromS3(key);

    return successResponse(res, null, "File deleted successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};