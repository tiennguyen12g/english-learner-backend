import { ResponseData, ResponseDataOutput, ResponseDataWhenError } from "./GlobalResponseData";
import { HttpStatus, HttpMessage } from "./GlobalResponseEnum";

interface HandleRequestProps<T> {
     execute: () => Promise<T>;
     actionName: string;
   }

export async function handleRequest<T>({
     execute,
     actionName,
   }: HandleRequestProps<T>): Promise<ResponseDataOutput<T | ResponseDataWhenError>> {
     try {
       const result: any = await execute();
       const isError = result.status === "Success" ? false : true;
       if(isError){
        return {
          status: result.status,
          result: result,
          statusCode: HttpStatus.ERROR,
          defaultMessage: HttpMessage.ERROR,
        }
       }
       return ResponseData<T>({
         status:"Success",
         result: result,
         statusCode: HttpStatus.SUCCESS,
         defaultMessage: HttpMessage.SUCCESS,
       });
     } catch (error) {
       console.log(actionName, error);
       return ResponseData<ResponseDataWhenError>({
         status: "Failed",
         result: {
           data: null,
           errorMessage: error.message,
           errorAction: actionName,
         },
         statusCode: HttpStatus.ERROR,
         defaultMessage: HttpMessage.ERROR,
       });
     }
   }