import cloudinary from "../../config/cloudinary.js";
import { HttpStatusCode } from "../constants/http.status.codes.js";
import { ResponseMessages } from "../constants/response.message.js";
import { CustomError } from "../errors/custom.error.js";

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
    if (!publicId) {
        throw new CustomError(
            ResponseMessages.INVALID_CLOUDINARY_PUBLIC_ID,
            HttpStatusCode.BAD_REQUEST
        );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
        throw new CustomError(
            ResponseMessages.DELETE_CLOUDINARY_IMAGE_FAILED,
            HttpStatusCode.INTERNAL_SERVER_ERROR
        );
    }
}
