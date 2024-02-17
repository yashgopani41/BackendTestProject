import connectDB from "./db/index.js";
import app from "./app.js";

// import 'dotenv/config'
import dotenv from "dotenv";
const port = process.env.PORT || 5000;

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`App Listening at PORT:http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed", error);
  });
