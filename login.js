const supabase =  require("./db.js");
const express = require("express");
require('dotenv').config();
const crypto = require('crypto');
const cors = require('cors');

const router = express.Router();

router.use(express.json());
router.use(cors({origin: '*'}));

function hashPassword(password) {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('hex');
    return hash;
}

router.route("/").get((req, res, next) => {
    res.status(200).json({ accountTypes: ["Admin", "Agent", "Farmer", "SME", "Vendor"] });
});

router.route("/validate").post(async (req, res) => {
    /*
    The request body should contain the following:
        {
        "id": 123,
        "password": "abcd"
        }   
    */

    const { id, password } = req.body;

    console.log(req.body);

    if (!id || !password) {
        res.status(400).json({ message: "Invalid request body" });
    }

    const hashedPassword = hashPassword(String(password) + String(id));

    // check the id and password in the User table, if password matches, generate an authentication token and send it back
    try {
        // const result = await supabase.any("SELECT password FROM User WHERE id = $1 AND password = $2", [id, hashedPassword]);
        const result = await supabase.any('SELECT password FROM "User" WHERE "id" = $1 AND "password" = $2', [id, hashedPassword]);

        console.log(result);
        // check password from result and match with hashedPassword, if matches, generate an authentication token and send it back
        if (result.length === 0) {
            res.status(401).json({ success: false, message: "Invalid ID or password" });
        } else {
            res.status(200).json({ success: true, message: "Login successful"});
        }
    } catch (error) {
        // Handle the error
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

});

module.exports = router;