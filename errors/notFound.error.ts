import AppError from "./appError.error"

class NotFoundError extends AppError {
    constructor(message: string = "Not found") {
        super(message, 404)
    }
}

export default NotFoundError;