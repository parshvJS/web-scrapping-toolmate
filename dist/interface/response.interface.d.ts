interface ApiResponse<T> {
    statuscode: number;
    data: T;
    message: string;
    success: boolean;
}
declare class ApiResponse<T> implements ApiResponse<T> {
    statuscode: number;
    data: T;
    message: string;
    success: boolean;
    constructor(statuscode: number, data: T, message?: string);
}
export { ApiResponse };
