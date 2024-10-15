import AppError from "./appError";

class BadRequestError extends AppError {
    constructor(message: string = "Bad request") {
        super(message, 400);
    }
}

export default BadRequestError;