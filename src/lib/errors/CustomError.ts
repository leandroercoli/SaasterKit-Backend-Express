import { StatusCodes } from 'http-status-codes';

type CustomErrorContent = {
    [key: string]: any;
};

// Custom error class
export class CustomError extends Error {
    public readonly httpStatusCode: StatusCodes;
    public readonly name: string;
    public readonly CustomErrorContent: CustomErrorContent;
    public readonly rawError: any;
    public readonly loggingEnabled: boolean = true;

    constructor(
        message: string,
        httpStatusCode: StatusCodes,
        name: string,
        errorContent?: CustomErrorContent,
        rawError?: any,
        loggingEnabled: boolean = true,
    ) {
        super(message);

        // Restore prototype chain - because we are extending a built in class
        Object.setPrototypeOf(this, CustomError.prototype);

        this.name = name;
        this.httpStatusCode = httpStatusCode;
        this.CustomErrorContent = errorContent;
        this.rawError = rawError;
        this.loggingEnabled = loggingEnabled;
    }

    public JSONError() {
        return {
            name: this.name,
            message: this.message,
            httpStatusCode: this.httpStatusCode,
            errorContent: this.CustomErrorContent,
            rawError: this.rawError,
            stack: this.stack,
        };
    }
}
