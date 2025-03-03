import { MongoClient } from "mongodb";

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

    async getAllImages(): Promise<Image[]> { 
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        const usersCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName || !usersCollectionName) {
            throw new Error("Missing collection names from environment variables");
        }

        const db = this.mongoClient.db();
        const imagesCollection = db.collection<Omit<Image, 'author'> & { author: string }>(collectionName);
        const usersCollection = db.collection<User>(usersCollectionName);

        const images = await imagesCollection.find().toArray();
        const authorIds = images.map(image => image.author);
        
        // Explicitly select both username and email fields
        const authors = await usersCollection.find({ _id: { $in: authorIds } }, { projection: { username: 1, email: 1 } }).toArray();
        
        const authorsMap = new Map(authors.map(author => [author._id, { username: author.username, email: author.email }]));
        return images.map(image => ({
            ...image,
            author: authorsMap.get(image.author) || { username: "Unknown", email: "" } // Fallback in case author is missing
        }));
    }
}
