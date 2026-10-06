import mongoose from "mongoose";
import { CustomError } from "../errors/custom.error.js";
import { ResponseMessages } from "../constants/response.message.js";
import { HttpStatusCode } from "../constants/http.status.codes.js";


export const validateObjectId = (id: string | undefined)=> {
  if (!id) {
    throw new CustomError(ResponseMessages.ID_MISSING,HttpStatusCode.BAD_REQUEST)
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError(ResponseMessages.INVALID_ID,HttpStatusCode.BAD_REQUEST)
    
  }

};
