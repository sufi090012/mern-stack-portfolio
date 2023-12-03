import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";

import userRouter from "./routes/user.js";
import tourRouter from "./routes/tour.js";
import skillRouter from "./routes/skill.js";
import projectRouter from "./routes/project.js";

import portfolioRouter from "./routes/portfolio.js";
import servicesRouter from "./routes/services.js";
import testimonialRouter from "./routes/testimonial.js";
import educationRouter from "./routes/education.js";
import path from "path";

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

if (process.env.NODE_ENV === "production") {
  // Allow requests from your Netlify frontend domain
  app.use(
    cors({
      origin: ["https://sufianmustafa.com/"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true, // Allow credentials such as cookies
    })
  );

  // Serve static files from the build folder
  app.use(express.static("FrontEnd/build", { maxAge: "1d" }));

  // Handle routes for your frontend app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "FrontEnd", "build", "index.html"));
  });
} else {
  // In development mode, you might want to enable CORS for local testing
  app.use(cors());
}

app.use("/users", userRouter);

app.use("/tour", tourRouter);
app.use("/skill", skillRouter);
app.use("/project", projectRouter);

app.use("/portfolio", portfolioRouter);
app.use("/education", educationRouter);
app.use("/services", servicesRouter);
app.use("/testimonial", testimonialRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Sufian Mustafa Portfolio (Backend) ");
});

const port = process.env.PORT || 8000;

mongoose
  .connect(
    "mongodb://sufi0900:sufi0900@ac-s3hligl-shard-00-00.miah2mi.mongodb.net:27017,ac-s3hligl-shard-00-01.miah2mi.mongodb.net:27017,ac-s3hligl-shard-00-02.miah2mi.mongodb.net:27017/Sufi?ssl=true&replicaSet=atlas-397tbw-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
