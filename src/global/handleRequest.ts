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
       console.log(`🔵 [handleRequest] Executing action: ${actionName}`);
       const result: any = await execute();
      console.log(`🔵 [handleRequest] Action ${actionName} completed, result:`, JSON.stringify(result, null, 2));
      
      // Check if result is a ResponseDataOutput structure (has status: "Success" or "Failed")
      // We need to distinguish between:
      // 1. ResponseDataOutput structure: { status: "Success" | "Failed", result: ..., statusCode: ..., defaultMessage: ... }
      // 2. Direct data object: { _id: ..., title: ..., status: "draft", ... } (where status is article status, not response status)
      const isResponseDataStructure = result && 
        typeof result === 'object' && 
        'status' in result && 
        (result.status === "Success" || result.status === "Failed") &&
        ('statusCode' in result || 'result' in result);
      
      if (isResponseDataStructure) {
        // Result is already a ResponseDataOutput structure
        if (result.status === "Success") {
          console.log(`✅ [handleRequest] Action ${actionName} succeeded with ResponseData structure`);
          return result as ResponseDataOutput<T>;
        } else {
          // Result has status "Failed" - return as error
          console.log(`❌ [handleRequest] Action ${actionName} returned error status:`, result.status);
          return result as ResponseDataOutput<ResponseDataWhenError>;
        }
      } else {
        // Result is direct data (not a ResponseDataOutput structure) - wrap in ResponseData
        console.log(`✅ [handleRequest] Action ${actionName} succeeded (direct data return), wrapping in ResponseData`);
        return ResponseData<T>({
          status: "Success",
          result: result,
          statusCode: HttpStatus.SUCCESS,
          defaultMessage: HttpMessage.SUCCESS,
        });
      }
     } catch (error) {
       console.error(`❌ [handleRequest] Error in action ${actionName}:`, error);
       console.error(`❌ [handleRequest] Error stack:`, error.stack);
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