const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const axios = require("axios");
const flash = require("connect-flash");
var timeout = require("connect-timeout");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.port;

app.use(express.json());
app.use(cors({ origin: "*" }));

const loginRouter = require("./login");
const registerRouter = require("./register");

app.use("/login", loginRouter);
app.use("/register", registerRouter);

// function makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() *
//  charactersLength));
//    }
//    return result;
// }

app.use(timeout("50s")); //set 10s timeout for all requests
// app.use(
//   session({
//     secret: makeid(25),
//     resave: false,
//     saveUninitialized: true,
//   })
// );
app.use(flash());

app.listen(PORT, async () => {
  // console.log(`Pushti-AuthenticationMS is running on port ${PORT}`);
  console.log(`Server listening on port ${PORT}`);
  try {
    let serviceRegisterUrl = String(process.env.serviceRegistryUrl) + "/register";

    await axios.post(serviceRegisterUrl, {
      name: process.env.selfName,
      url: process.env.selfUrl,
    });
    console.log("Service registered successfully");
  } catch (error) {
    console.error("Failed to register service:", error);
    // turn off server if service registration fails
    process.exit(1);
  }
});

// Function to de-register the service
const deregisterService = async () => {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/deregister";
    await axios.post(serviceRegisterUrl, { name: process.env.selfName });
    console.log("Service de-registered successfully");
  } catch (error) {
    console.error("Failed to de-register service:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
    await deregisterService();
    process.exit(0);
};

// Listen for termination and interrupt signals
process.on('SIGTERM', gracefulShutdown); // For termination signal
process.on('SIGINT', gracefulShutdown); // For interrupt signal
process.on('uncaughtException', gracefulShutdown); // For uncaught exceptions

