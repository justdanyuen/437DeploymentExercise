"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = require("mongodb");
const ImageProvider_1 = require("./ImageProvider");
const images_1 = require("./routes/images");
const auth_1 = require("./routes/auth");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";
const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";
async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME, IMAGES_COLLECTION_NAME } = process.env;
    if (!MONGO_USER || !MONGO_PWD || !MONGO_CLUSTER || !DB_NAME || !IMAGES_COLLECTION_NAME) {
        console.error("Missing required MongoDB environment variables.");
        process.exit(1);
    }
    const encodedPassword = encodeURIComponent(MONGO_PWD); // URL-encode password
    const connectionString = `mongodb+srv://${MONGO_USER}:${encodedPassword}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;
    console.log("Attempting Mongo connection...");
    try {
        const mongoClient = await mongodb_1.MongoClient.connect(connectionString);
        const db = mongoClient.db();
        // Debug: Print collection names (remove later)
        const collectionInfos = await db.listCollections().toArray();
        console.log(collectionInfos.map((collectionInfo) => collectionInfo.name));
        // Set up Express
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use(express_1.default.static(staticDir));
        app.use("/uploads", express_1.default.static(uploadDir)); // Serve uploaded images
        // Create an instance of ImageProvider
        const imageProvider = new ImageProvider_1.ImageProvider(mongoClient);
        // Routes
        app.get("/hello", (req, res) => {
            res.send("Hello, World!");
        });
        // app.use("/api/*", verifyAuthToken);
        (0, images_1.registerImageRoutes)(app, imageProvider);
        (0, auth_1.registerAuthRoutes)(app, mongoClient);
        app.get("*", (req, res) => {
            console.log("None of the routes above were matched");
            res.sendFile(path_1.default.resolve(staticDir, "index.html"));
        });
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}
setUpServer();
