interface ApiResponse<T> {
    statuscode: number;
    data: T;
    message: string;
    success: boolean;
}

class ApiResponse<T> implements ApiResponse<T> {
    statuscode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(statuscode: number, data: T, message: string = "Success") {
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
        this.success = statuscode < 400;
    }
}

export { ApiResponse };