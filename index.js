import express from "express"
import dotenv from "dotenv"
import connectDb from "./Utility/db.js"
import User from "./models/user.model.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user.routes.js"

dotenv.config()

const app = express()


app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const port = process.env.PORT || 4000

connectDb()

app.use("/api/v1/user",userRoute)



app.listen(port, () => {
  console.log(`Server is listening on port : ${port}`)
})



// mongodb+srv://biswajit:1810Biswa@cluster0.20lyn.mongodb.net/cohort