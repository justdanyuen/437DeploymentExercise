"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerImageRoutes = registerImageRoutes;
const ImageProvider_1 = require("../ImageProvider");
function registerImageRoutes(app, mongoClient) {
    const imageProvider = new ImageProvider_1.ImageProvider(mongoClient);
    app.get("/api/images", async (req, res) => {
        try {
            const images = await imageProvider.getAllImages();
            res.json(images);
        }
        catch (error) {
            console.error("Failed to fetch images:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
