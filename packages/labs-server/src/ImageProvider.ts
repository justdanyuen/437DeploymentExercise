import { MongoClient, ObjectId } from "mongodb";

interface Image {
    _id: string;
    src: string;
    name: string;
    author: {
        username: string;
        email: string;
    };
    likes: number;
    }

interface User {
    _id: string;
    username: string;
    email: string;
}

export class ImageProvider {
    constructor(private readonly mongoClient: MongoClient) {}

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing image collection name from environment variables");
        }

        const db = this.mongoClient.db();
        const imagesCollection = db.collection<{ _id: string }>(collectionName);

        const result = await imagesCollection.updateOne(
            { _id: imageId },
            { $set: { name: newName } }
        );

        return result.matchedCount;
    }

    async getAllImages(createdBy?: string): Promise<Image[]> { 
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        const usersCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName || !usersCollectionName) {
            throw new Error("Missing collection names from environment variables");
        }

        const db = this.mongoClient.db();
        const imagesCollection = db.collection<Omit<Image, 'author'> & { author: string, src: string }>(collectionName);
        const usersCollection = db.collection<User>(usersCollectionName);

        const query: any = {};
        if (createdBy) {
            query.author = createdBy;
        }

        const images = await imagesCollection.find(query).toArray();
        const authorIds = images.map(image => image.author);

        const authors = await usersCollection.find(
            { _id: { $in: authorIds } }, 
            { projection: { _id: 1, username: 1, email: 1 } }
        ).toArray();
        
        const authorsMap = new Map(authors.map(author => [
            author._id, { id: author._id, username: author.username, email: author.email }
        ]));

        return images.map(image => ({
            ...image,
            src: image.src.startsWith('http') 
                ? image.src
                : `/api/image/${image._id}`,
            author: authorsMap.get(image.author) || { id: image.author, username: "Unknown", email: "" }
        }));
    }

    async createImage(image: {src: string; name: string; author: string; likes: number }): Promise<void> {
        if(image === undefined) {
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