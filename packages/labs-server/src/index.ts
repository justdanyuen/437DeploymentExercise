import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/images";
import { registerAuthRoutes, verifyAuthToken } from "./routes/auth";

dotenv.config();

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
        const mongoClient = await MongoClient.connect(connectionString);
        const db = mongoClient.db();

        const collectionInfos = await db.listCollections().toArray();
        console.log(collectionInfos.map((collectionInfo) => collectionInfo.name));

        const app = express();
        app.use(express.json());
        app.use(express.static(staticDir));
        app.use("/uploads", express.static(uploadDir)); // Serve uploaded images

        const imageProvider = new ImageProvider(mongoClient);

        app.get("/hello", (req: Request, res: Response) => {
            res.send("Hello, World!");
        });

        app.use("/api/*", verifyAuthToken);

        registerImageRoutes(app, imageProvider);
        registerAuthRoutes(app, mongoClient);

        app.get("*", (req: Request, res: Response) => {
            console.log("None of the routes above were matched");
            res.sendFile(path.resolve(staticDir, "index.html"));
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

setUpServer();