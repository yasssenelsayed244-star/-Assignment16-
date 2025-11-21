import { Response } from "express";

export const successResponse = (res: Response, data: any, message = "Success") => {
  return res.status(200).json({ status: "success", message, data });
};

export const createdResponse = (res: Response, data: any, message = "Created") => {
  return res.status(201).json({ status: "success", message, data });
};

export const errorResponse = (res: Response, error: any) => {
  const status = error?.status || 500;
  const message = error?.message || "Internal Server Error";
  return res.status(status).json({ status: "error", message });
};
