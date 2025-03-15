"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMiddlewareFactory = void 0;
exports.handleImageFileErrors = handleImageFileErrors;
const multer_1 = __importDefault(require("multer"));
class ImageFormatError extends Error {
}
const storageEngine = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.IMAGE_UPLOAD_DIR || "uploads");
    },
    filename: function (req, file, cb) {
        const mimeTypeMap = {
            "image/png": "png",
            "image/jpg": "jpg",
            "image/jpeg": "jpg"
        };
        const fileExtension = mimeTypeMap[file.mimetype];
        if (!fileExtension) {
            return cb(new ImageFormatError("Unsupported image type"), "");
        }
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
        cb(null, fileName);
    }
});
exports.imageMiddlewareFactory = (0, multer_1.default)({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});
function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer_1.default.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}
