import { ErrorRequestHandler } from "express";
import BadRequestError from "../errors/badRequest.error";
import NotAuthorizedError from "../errors/notAuthorized.error";
import { error } from "console";
import config from "../config";

const handleCastErrorDB: ErrorRequestHandler = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new BadRequestError(message);
};

const handleDuplicateValueError: ErrorRequestHandler = (err) => {
  const message = "Duplicate value.";
  return new BadRequestError(message);
};

const handleValidationErrors: ErrorRequestHandler = (err) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid inout data ${errors.join(". ")}`;
  return new BadRequestError(message);
};

const handleJWTError: ErrorRequestHandler = (err) => {
  const message = "Invalid token, please log in again.";
  return new NotAuthorizedError(message);
};

const handleTokenExpError: ErrorRequestHandler = (err) => {
  const message = "Expired token, please log in again";
  return new NotAuthorizedError(message);
};

const sendErrorDev: ErrorRequestHandler = (err, req, res) => {
  // if(req.originalUrl.startsWith("/api"))
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd: ErrorRequestHandler = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went very wrong",
    });
  }
};
const errorOptions: ErrorRequestHandler = (err, req, res, next) => {
  let error: any;
  if (err.name === "CastError") error = handleCastErrorDB(err, req, res, next);
  if (err.code === 11000)
    error = handleDuplicateValueError(err, req, res, next);
  if (err.name === "ValidationError")
    error = handleValidationErrors(err, req, res, next);
  if (err.name === "JsonWebTokenError")
    error = handleJWTError(err, req, res, next);
  if (err.name === "TokenExpiredError")
    error = handleTokenExpError(err, req, res, next);

  return error;
};

const GlobalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error: any;

  if (config.NODE_ENV === "production") {
    error = errorOptions(err, req, res, next);
    sendErrorProd(error || err, req, res, next);
  } else {
    error = errorOptions(err, req, res, next);
    sendErrorDev(error || err, req, res, next);
  }

  next();
};

export default GlobalErrorHandler;
