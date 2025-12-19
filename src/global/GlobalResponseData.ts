interface ResponseDataProps<D>{
    status:"Success" | "Failed";
    result: D | D[];
    statusCode: number;
    defaultMessage: string;
}
interface ResponseDataOutput<D> extends ResponseDataProps<D>{
}
interface ResponseDataWhenError{
    // status:"Success" | "Failed",
    data: any,
    errorMessage: string,
    errorAction: string,
}
export function ResponseData<D>({result, statusCode, defaultMessage, status}: ResponseDataProps<D>): ResponseDataOutput<D>{
    return {
        status: status,
        result: result,
        statusCode: statusCode,
        defaultMessage: defaultMessage,
    }
}

export {
    ResponseDataOutput, 
    ResponseDataWhenError,
}