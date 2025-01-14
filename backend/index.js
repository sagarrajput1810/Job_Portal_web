import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"
import connectDB from "./utils/db.js";
dotenv.config({})

const app = express();


// Tempary backend server
// app.get("/home",(req,res)=>{
//     return res.status(200).json({
//         message:"I am comming from backend",
//         success: true
//     })
// })

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const corsOptions = {
    origin: 'http//localhost:5173',
    credentiala:true
}
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/company",companyRoute);
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute);
app.listen(PORT,()=>{
    connectDB();
    console.log("Server running at port",PORT);
})