import { Request, Response, NextFunction } from "express";
import multer from "multer";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.IMAGE_UPLOAD_DIR || "uploads");
    },
    filename: function (req, file, cb) {
        const mimeTypeMap: { [key: string]: string } = {
            "image/png": "png",
            "image/jpg": "jpg",
            "image/jpeg": "jpg"
        };
        
        const fileExtension = mimeTypeMap[file.mimetype];
        if (!fileExtension) {
            return cb(new ImageFormatError("Unsupported image type"), "");
        }
        
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
        cb(null, fileName);    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}