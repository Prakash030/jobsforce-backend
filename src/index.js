import express from "express"
import { configDotenv } from "dotenv"
import bodyParser from "body-parser"
import cors from 'cors';
import { errorResponse } from "./middlewares/errorMiddleware.js";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";

configDotenv()

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("Welcome to the jobsforce Server!!!");
});

const PORT = process.env.PORT || 4000

routes(app)

app.use(errorResponse)

app.listen(PORT,() => {
    connectDB()
    // change to check ec2 workflow
    console.log(`Server running on ${PORT}`)
})