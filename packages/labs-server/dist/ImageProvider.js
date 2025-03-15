"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProvider = void 0;
class ImageProvider {
    mongoClient;
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
    }
    async updateImageName(imageId, newName) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing image collection name from environment variables");
        }
        const db = this.mongoClient.db();
        const imagesCollection = db.collection(collectionName);
        const result = await imagesCollection.updateOne({ _id: imageId }, { $set: { name: newName } });
        return result.matchedCount;
    }

    async getAllImages(createdBy) { 
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing image collection name from environment variables");
        }
    
        const db = this.mongoClient.db();
        const imagesCollection = db.collection(collectionName);
    
        const query = {};
        if (createdBy) {
            query.author = createdBy;
        }
    
        const images = await imagesCollection.find(query).toArray();
    
        return images.map(image => ({
            ...image,
            src: image.src.startsWith('http') ? image.src : `/api/image/${image._id}`,
        }));
    }
    
    async createImage(image) {
        if (image === undefined) {
            throw new Error("Image is undefined");
        }
        const db = this.mongoClient.db();
        const imagesCollectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!imagesCollectionName) {
            throw new Error("Missing collection name from environment variables");
        }
        const imagesCollection = db.collection(imagesCollectionName);
        await imagesCollection.insertOne(image);
    }
}
exports.ImageProvider = ImageProvider;
