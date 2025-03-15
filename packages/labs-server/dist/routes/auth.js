"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = verifyAuthToken;
exports.registerAuthRoutes = registerAuthRoutes;
const express_1 = require("express");
const CredentialsProvider_1 = require("../CredentialsProvider");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signatureKey = process.env.JWT_SECRET || "default_secret";
if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
}
function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ username: username }, signatureKey, { expiresIn: "1d" }, (error, token) => {
            if (error)
                reject(error);
            else
                resolve(token);
        });
    });
}
function verifyAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");
    console.log("Full Authorization Header:", authHeader); // Debug log
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    console.log("Received Token:", token);
    jsonwebtoken_1.default.verify(token, signatureKey, (error, decoded) => {
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
function registerAuthRoutes(app, mongoClient) {
    const router = (0, express_1.Router)();
    const credentialsProvider = new CredentialsProvider_1.CredentialsProvider(mongoClient);
    router.post("/register", async (req, res) => {
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
            const token = jsonwebtoken_1.default.sign({ username, exp: expirationTime }, signatureKey);
            res.status(201).json({ token });
        }
        catch (error) {
            console.error("Failed to register user:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
    router.post("/login", async (req, res) => {
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
            const token = jsonwebtoken_1.default.sign({ username, exp: expirationTime }, signatureKey);
            res.status(200).json({ token });
        }
        catch (error) {
            console.error("Failed to log in user:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
    app.use("/auth", router); // Register the router with the app
}
