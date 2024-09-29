// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import axios from 'axios';
import cors from "cors";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});