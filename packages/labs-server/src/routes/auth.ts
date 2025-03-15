import express, { Router, Request, Response, Application, NextFunction } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const signatureKey = process.env.JWT_SECRET || "default_secret";

if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
}

function generateAuthToken(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            { username: username },
            signatureKey,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get("Authorization");
    console.log("Full Authorization Header:", authHeader); // Debug log

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }

    console.log("Received Token:", token);

    jwt.verify(token, signatureKey, (error, decoded) => {
        if (error) {
            console.error("JWT Verification Error:", error); 
            res.status(403).json({ error: "Forbidden: Invalid token" });
            return;
        }
        // console.log("Decoded Token:", decoded);
        if (decoded) {
            res.locals.token = decoded; // Store decoded token in response locals
            next();
        }
    });
    return;
}

export function registerAuthRoutes(app: Application, mongoClient: MongoClient) {
    const router = Router();
    const credentialsProvider = new CredentialsProvider(mongoClient);

    router.post("/register", async (req: Request, res: Response) => {
        try {
            console.log("Register request received:", req.body);
            const { username, password } = req.body;
    
            if (!username || !password) {
                res.status(400).json({
                    error: "Bad request",
                    message: "Missing username or password",
                });
                return;
            }
    
            const success = await credentialsProvider.registerUser(username, password);
            
            if (!success) {
                res.status(400).json({
                    error: "Username already taken",
                    message: "A user with that username already exists",
                });
                return;
            }
    
            const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
            const token = jwt.sign(
                { username, exp: expirationTime },
                signatureKey
            );
    
            res.status(201).json({ token });
    
        } catch (error) {
            console.error("Failed to register user:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
    

    router.post("/login", async (req: Request, res: Response) =>{
        try {
            console.log("Login request received:", req.body);
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({
                    error: "Bad request",
                    message: "Missing username or password",
                });
                return;
            }

            const isValid = await credentialsProvider.verifyPassword(username, password);
            if (!isValid) {
                res.status(400).json({
                    error: "Incorrect username or password",
                });
                return;
            }

            const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
            const token = jwt.sign(
                { username, exp: expirationTime },
                signatureKey
            );

            res.status(200).json({ token });

        } catch (error) {
            console.error("Failed to log in user:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });

    app.use("/auth", router); // Register the router with the app
}