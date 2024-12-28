import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/asyncHandler";
import BadRequestError from "../errors/badRequest.error";
import jwt from "jsonwebtoken";
import config from "../config";
import User, { UserTypes } from "../models/user.model";
import { CustomRequest, JWTPayload } from "./middleware.types";

const protect = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Read the token if it exists
    let token: string;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      throw new BadRequestError("No authentication token.");
    }

    // Decode the token
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    // Check if user exists
    const user = await User.findById(decodedToken.id).where({ active: true });
    if (!user)
      throw new BadRequestError("User no longer exists, please login again.");

    // Check if user changed password after token was issued
    const passwordChanged = user.changedPasswordAfter(decodedToken.iat);
    if (passwordChanged)
      throw new BadRequestError(
        "Password changed by user, please log in again."
      );

    req.currentUser = user;

    next();
  }
);

export default protect;
