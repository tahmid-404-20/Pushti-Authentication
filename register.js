const supabase = require("./db.js");
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const crypto = require("crypto");
const cors = require("cors");
const fetch = require("node-fetch");

const router = express.Router();

router.use(express.json());
router.use(cors({ origin: "*" }));

function hashPassword(password) {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("hex");
  return hash;
}

async function fetchDataGETMethod(path) {
  try {
    console.log(String(process.env.locationMsURL) + String(path));
    //   const response = await fetch(String(process.env.locationMsUrl) + String(path));
    const response = await axios.get(
      String(process.env.locationMsURL) + String(path)
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error:", error);
    return null; // Return null or handle the error as needed
  }
}

router.route("/farmer").get(async (req, res) => {
  /* {
        "farmerTypes": [
            "Dairy",
            "Poultry"
        ],
        "divisions": [
            "Dhaka",
            "Sylhet"
        ]
    } */

  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await fetchDataGETMethod("/division");
    res
      .status(200)
      .json({ farmerTypes: ["Dairy", "Poultry"], divisions: divisions.data });
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
});

router.route("/sme").get(async (req, res) => {
  /* {
          "farmerTypes": [
              "Dairy",
              "Poultry"
          ],
          "divisions": [
              "Dhaka",
              "Sylhet"
          ]
      } */

  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await fetchDataGETMethod("/division");
    res.status(200).json({ divisions: divisions.data });
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
});

router.route("/vendor").get(async (req, res) => {
  /* {
          "farmerTypes": [
              "Dairy",
              "Poultry"
          ],
          "divisions": [
              "Dhaka",
              "Sylhet"
          ]
      } */

  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await fetchDataGETMethod("/division");
    res.status(200).json({ divisions: divisions.data });
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
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
    const result = await supabase.any(
      'SELECT password FROM "User" WHERE "id" = $1 AND "password" = $2',
      [id, hashedPassword]
    );

    console.log(result);
    // check password from result and match with hashedPassword, if matches, generate an authentication token and send it back
    if (result.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      res.status(200).json({ success: true, message: "Login successful" });
    }
  } catch (error) {
    // Handle the error
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
