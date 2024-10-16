import AppError from "./appError";

class NotAuthorizedError extends AppError {
    constructor(message: string = "Not authorized") {
        super(message, 401);
    }
}

export default NotAuthorizedError;