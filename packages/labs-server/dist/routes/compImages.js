"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerImageRoutes = registerImageRoutes;
const imageUploadMiddleware_1 = require("../imageUploadMiddleware");
function registerImageRoutes(app, imageProvider) {
    app.get("/api/images", async (req, res) => {
        try {
            let userId = undefined;
            if (typeof req.query.createdBy === "string") {
                userId = req.query.createdBy;
            }
            console.log("Filtering images by author:", userId || "No filter applied");
            const images = await imageProvider.getAllImages(userId);
            console.log("Retrieved Images:", JSON.stringify(images, null, 2));
            res.json(images);
        }
        catch (error) {
            console.error("Failed to fetch images:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    app.patch("/api/images/:id", async (req, res) => {
        try {
            const imageId = req.params.id;
            const { name } = req.body;
            if (!name) {
                res.status(400).json({ error: "New name is required" });
                return;
            }
            console.log("Image ID:", imageId);
            console.log("New Name:", name);
            const matchedCount = await imageProvider.updateImageName(imageId, name);
            if (matchedCount === 0) {
                res.status(404).json({ error: "Image not found" });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Failed to update image name:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    // app.post("/api/images",imageMiddlewareFactory.single("image"), handleImageFileErrors, async (req: Request, res: Response) => {
    //         res.status(500).send("Not implemented");
    //         return;
    //     }
    // )
    app.post("/api/images", imageUploadMiddleware_1.imageMiddlewareFactory.single("image"), // Parses multipart form data
    imageUploadMiddleware_1.handleImageFileErrors, // Handles any errors from multer
    async (req, res) => {
        try {
            if (!req.file || !req.body.title) {
                res.status(400).json({ error: "Missing required fields." });
                return;
            }
            // Extract username from authentication token
            const user = res.locals.token; // This was set by verifyAuthToken
            if (!user || !user.username) {
                return res.status(401).json({ error: "Unauthorized: Missing user information." });
            }
            // Generate image metadata
            const imageDocument = {
                _id: req.file.filename, // Use filename as unique ID
                src: `/uploads/${req.file.filename}`, // Path where the image is served
                name: req.body.title, // Image title from form
                author: user.username, // Extracted from JWT token
                likes: 0, // Initial likes set to 0
            };
            // Insert into the database (replace with your DB logic)
            await database.collection("images").insertOne(imageDocument);
            res.status(201).json(imageDocument); // Respond with created image
        }
        catch (error) {
            console.error("Upload Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
