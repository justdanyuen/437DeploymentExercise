"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsProvider = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class CredentialsProvider {
    collection;
    constructor(mongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection(COLLECTION_NAME);
        console.log(`Connected to database: ${mongoClient.db().databaseName}`);
        console.log(`Using collection: ${COLLECTION_NAME}`);
    }
    async registerUser(username, plaintextPassword) {
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
            console.log(`User ${username} already exists in the database.`);
            return false;
        }
        //salt and hash
        try {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(plaintextPassword, salt);
            const result = this.collection.insertOne({
                username,
                password: hashedPassword,
            });
            console.log(`Inserted user: ${username}`, result);
            return true;
        }
        catch (error) {
            console.error(`Error inserting user ${username}:`, error);
            return false;
        }
    }
    async verifyPassword(username, plaintextPassword) {
        const user = await this.collection.findOne({ username });
        if (!user) {
            return false;
        }
        const comp = await bcrypt_1.default.compare(plaintextPassword, user.password);
        return comp;
    }
}
exports.CredentialsProvider = CredentialsProvider;
