import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "../config/s3.config";
import crypto from "crypto";

// رفع ملف واحد إلى S3
export const uploadFileToS3 = async (
  file: Express.Multer.File,
  folder: string = ""
): Promise<{ key: string; url: string }> => {
  // توليد اسم فريد للملف
  const fileName = `${folder}${crypto.randomBytes(16).toString("hex")}-${Date.now()}${getFileExtension(file.originalname)}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: "public-read" // إذا كنت تريد الملف يكون عام
  });

  await s3Client.send(command);

  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return {
    key: fileName,
    url: fileUrl
  };
};

// رفع عدة ملفات
export const uploadMultipleFilesToS3 = async (
  files: Express.Multer.File[],
  folder: string = ""
): Promise<Array<{ key: string; url: string }>> => {
  const uploadPromises = files.map(file => uploadFileToS3(file, folder));
  return await Promise.all(uploadPromises);
};

// حذف ملف من S3
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  await s3Client.send(command);
};

// الحصول على رابط مؤقت للملف (Signed URL)
export const getSignedFileUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Helper: الحصول على امتداد الملف
const getFileExtension = (filename: string): string => {
  return filename.substring(filename.lastIndexOf("."));
};