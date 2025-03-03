import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
import { ImageProvider } from "./ImageProvider";

dotenv.config();

const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

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

        // Debug: Print collection names (remove later)
        const collectionInfos = await db.listCollections().toArray();
        console.log(collectionInfos.map((collectionInfo) => collectionInfo.name));

        // Set up Express
        const app = express();
        app.use(express.static(staticDir));

        // Create an instance of ImageProvider
        const imageProvider = new ImageProvider(mongoClient);

        // Routes
        app.get("/hello", (req: Request, res: Response) => {
            res.send("Hello, World!");
        });

        app.get("/api/images", async (req: Request, res: Response) => {
            try {
                const images = await imageProvider.getAllImages();
                res.json(images);
            } catch (error) {
                console.error("Failed to fetch images:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });

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

// Start the server
setUpServer();

