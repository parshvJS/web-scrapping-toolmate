declare class ApiError extends Error {
    statuscode: number;
    errors: any[];
    data: any;
    success: boolean;
    constructor(statuscode: number, message?: string, errors?: any[], stack?: string);
}
export { ApiError };
