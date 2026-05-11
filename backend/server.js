import express from "express";
import dotenv from "dotenv";
import connectionDB from "./config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import taskRouter from "./routes/task.routes.js"
import dashRouter from "./routes/dash.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import { createServer } from "http";
dotenv.config();
//swagger 
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4001;
connectionDB();

app//middlewares
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors({
    origin:'*',

}))

//swagger implementation
const options = {
swaggerDefinition:{
        openapi:"3.0.0",
    info:{
        title:"Backend API",
        version:"1.0.0",
        description:"The Backend API documentation"
    },
    servers:[{url:"http://localhost:4001"}],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
},
    apis:["./routes/*.routes.js"]
}
//routes for swagger UI
const swagger = swaggerJSDoc(options);
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swagger))    


app.get("/",(req,res)=>res.send("Hello there"))

app.use("/auth",authRouter)
app.use("/users",userRouter)
app.use("/task",taskRouter)
app.use("/dashboard", dashRouter)
app.use("/notifications", notificationRouter)




server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
