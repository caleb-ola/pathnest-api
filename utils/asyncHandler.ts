import { NextFunction, Request, Response } from "express";

interface AsyncHandlerFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

const AsyncHandler = (fn: AsyncHandlerFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default AsyncHandler;
