const path = require("path");
const express = require('express'); 
const cors = require('cors');
require('dotenv').config();
const session = require("express-session");
const flash = require("connect-flash");
var timeout = require("connect-timeout");
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.port;

app.use(express.json());
app.use(cors({origin: '*'}));

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


app.listen(PORT, () => {
    console.log(`Pushti-AuthenticationMS is running on port ${PORT}`);
});


