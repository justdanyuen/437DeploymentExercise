import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);

        console.log(`Connected to database: ${mongoClient.db().databaseName}`);
        console.log(`Using collection: ${COLLECTION_NAME}`);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const existingUser = await this.collection.findOne({username});
        if (existingUser) {
            console.log(`User ${username} already exists in the database.`);
            return false;
        }

        //salt and hash
        try{
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(plaintextPassword, salt)

            const result = this.collection.insertOne({
                username,
                password: hashedPassword,
            });


            console.log(`Inserted user: ${username}`, result);
            return true;
        } catch (error) {
            console.error(`Error inserting user ${username}:`, error);
            return false;
        }
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        const user = await this.collection.findOne({username});
        if (!user){return false;} 
        
        const comp = await bcrypt.compare(plaintextPassword, user.password);
        return comp;
    }
}
