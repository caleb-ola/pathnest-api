// src/index.js
import process from "process";
import mongoose from "mongoose";

import app from "./app";
import config from "./config";


process.on("uncaughtExpression", (err: any) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXPRESSION, SHUTTING DOWN .....");
  process.exit(1);
})

const port = config.PORT;

//Database Connection
const URI = config.DATABASE.replace("<PASSWORD>", config.DATABASE_PASSWORD);

mongoose.connect(URI).then(() => {
  console.log("Database connection successful");
})

const server = app.listen(port, () => {
  console.log(`${config.APP_NAME} App(API) is listening on port ${port} in ${config.NODE_ENV} mode.`);
});

process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION, SHUTTING DOWN .....");
  server.close(() => {
    process.exit(1);
  })
})