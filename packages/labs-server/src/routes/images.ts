import express, { Request, Response, Application } from "express";
import { ImageProvider } from "../ImageProvider";
import { imageMiddlewareFactory, handleImageFileErrors } from "../imageUploadMiddleware";
import { ObjectId } from "mongodb";

export function registerImageRoutes(app: Application, imageProvider: ImageProvider) {
    app.get("/api/images", async (req: Request, res: Response) => {
        try {
            let userId: string | undefined = undefined;
            if (typeof req.query.createdBy === "string") {
                userId = req.query.createdBy;
            }

            console.log("Filtering images by author:", userId || "No filter applied");

            const images = await imageProvider.getAllImages(userId);

            console.log("Retrieved Images:", JSON.stringify(images, null, 2));

            res.json(images);
        } catch (error) {
            console.error("Failed to fetch images:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.patch("/api/images/:id", async (req: Request, res: Response) => {
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
        } catch (error) {
            console.error("Failed to update image name:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // app.post("/api/images",imageMiddlewareFactory.single("image"), handleImageFileErrors, async (req: Request, res: Response) => {
    //         res.status(500).send("Not implemented");
    //         return;
    //     }
    // )

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: Request, res: Response) => {
            try {
                if (!req.file || !req.body.title) {
                    res.status(400).json({ error: "Missing file or image name." });
                    return;
                }

                const user = res.locals.token; // This was set by verifyAuthToken
                if (!user || !user.username) {
                    res.status(401).json({ error: "Unauthorized: Missing user information." });
                    return;
                }

                const imageDocument = {
                    src: `/uploads/${req.file.filename}`,
                    name: req.body.title,
                    author: user.username, // Extracted from JWT token
                    likes: 0, // Initial likes set to 0
                };

                console.log("Prepared Image Data:", imageDocument);

                const savedImage = await imageProvider.createImage(imageDocument);
                console.log(" Image stored in DB:", savedImage);

                res.status(201).json(imageDocument); 
            } catch (error) {
                console.error("Upload Error:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    );


    
}
