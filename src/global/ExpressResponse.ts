import { HttpStatus } from "@nestjs/common";
import {Response} from "express"
export function ExpressResponse({expressResponse, httpOK, jsonData} : {expressResponse: Response, httpOK: HttpStatus, jsonData: any}){
     return expressResponse.status(httpOK).json(JSON.stringify(jsonData));
}