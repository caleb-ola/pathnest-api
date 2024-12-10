import { NextFunction, Response } from "express";
import { UserTypes } from "../models/user.model";
import { CustomRequest } from "./middleware.types";
import NotAuthorizedError from "../errors/notAuthorized.error";

const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser.role)) {
      throw new NotAuthorizedError(
        "You are not authorized to perform this action."
      );
    }

    next();
  };
};
