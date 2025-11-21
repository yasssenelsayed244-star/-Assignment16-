import { Request, Response } from "express";
import { loginUser } from "../modules/user/user.service";
import { successResponse, errorResponse } from "../utils/response";
import UserModel from "../modules/user/user.model";

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (user && !user.isEmailVerified) {
      return errorResponse(res, {
        status: 403,
        message: "Please verify your email before logging in",
      });
    }

    const loggedUser = await loginUser(req.body);
    return successResponse(res, loggedUser, "Logged in successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};
