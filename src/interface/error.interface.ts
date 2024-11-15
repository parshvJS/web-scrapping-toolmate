class ApiError extends Error {
    statuscode: number;
    errors: any[];
    data: any;
    success: boolean;

    constructor(statuscode: number, message = "Something went wrong!", errors: any[] = [], stack = "") {
        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.errors = errors;
        this.data = null;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };