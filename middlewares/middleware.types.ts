import { Request } from "express";

export interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  currentUser?: any;
}
