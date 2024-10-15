import AppError from "./appError";

class NotAuthorized extends AppError {
    constructor(message: string = "Not authorized") {
        super(message, 401);
    }
}

export default NotAuthorized;