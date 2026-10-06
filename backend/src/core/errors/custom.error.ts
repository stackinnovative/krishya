import type { Response } from "express";
import { HttpStatusCode } from "../constants/http.status.codes.js"; 
import { ResponseMessages } from "../constants/response.message.js"; 
import { z } from 'zod';
import { ZodError } from "zod";

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "CustomError";
  }
}

const formatZodError = (err: ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  err.issues.forEach(issue => {
    const field = issue.path.join('.');
    errors[field] = issue.message;
  });

  return errors;
};


export const handleError = (res: Response, err: unknown): void => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else if (err instanceof z.ZodError) {
    const formattedErrors = formatZodError(err);
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: ResponseMessages.VALIDATION_FAILED,
      errors: formattedErrors
    });
  }
  else {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: ResponseMessages.SERVER_ERROR });
  }
}