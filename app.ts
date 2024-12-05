import express, { Express, Request, Response } from "express";
import axios from 'axios';
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import MongoSanitize from "express-mongo-sanitize";
// import xss from "xss";


import dotenv from "dotenv";
dotenv.config();

import config from "./config";
import routers from "./routers/router"
import BadRequestError from "./errors/badRequest.error";
import GlobalErrorHandler from "./controllers/error.controller";


const app: Express = express();

// GLOBAL MIDDLEWARES
if (config.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to a maximum of 100 requests per window
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    message: "Too many requests from this IP address."
})

app.use(limiter); // Rate limiting for IP address
app.use(cors()); // Allow cross origin resource sharing (CORS) support
app.use(hpp()); // Prevent parameter pollution (duplicate query strings)
app.use(MongoSanitize());
app.use(helmet());
// app.use(xss()); // Data sanitization against cross site scripting

// Parse JSON data with incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routers);

app.all("*", () => {
    throw new BadRequestError("Route not found.")
});

app.use(GlobalErrorHandler);


app.post("/provide-recommendation", async (req: Request, res: Response, Next: any) => {
    // console.log(req.body);
    try {
        // Sending a request to the Flask API
        const flaskResponse = await axios.post('http://127.0.0.1:5000/recommend', {
            input: req.body.input
        });

        // Sending the API response from the Flask API
        res.json({
            success: true,
            data: {
                data: flaskResponse.data
            }
        });
    } catch (error) {
        console.error('Error connecting to Flask API:', error);
        res.status(500).json({
            success: false,
            message: 'Error connecting to Flask API',
        });
    }

});

export default app;