const supabase = require("./db.js");
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");
const crypto = require("crypto");
const fetch = require("node-fetch");

const router = express.Router();

router.use(express.json());
router.use(cors({ origin: "*" }));

function hashPassword(password) {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("hex");
  return hash;
}

async function getLocationMsUrl() {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/get-service";
    response = await axios.post(serviceRegisterUrl, {
      name: process.env.locationMsName,
    });
    // console.log(response.data);

    if (response.data.success) {
      return response.data.url;
    } else {
      console.log(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error recovering location-data", error);
    return null;
  }
}

async function deleteUserTableEntry(userId) {
  let query = `DELETE FROM "User" WHERE "id" = $1`;
  try {
    await supabase.any(query, [userId]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting from User table");
  }
}

router.route("/submit").post(async (req, res) => {
  /* 
    {
   "accountType": "Vendor",
   "farmerType": null,
    "nid": "12345678901234567890",
    "name": "test",
    "password": "test",
    "dob": "2020-12-12",
    "address": "test",
    "mobile": "1234567890",
    "union": 1
    "email": "test@test.com"
}
  */ // request body consists of the fields above, insert them into User table and give a userId
  // then insert the userId and the accountType into the the corresponding table, account type can be either "Farmer", "SME" or "Vendor"

  // insert into User table using parameterized query
  const {
    accountType,
    farmerType,
    nid,
    name,
    password,
    dob,
    permanentAddress,
    mobile,
    union,
    email,
  } = req.body;

  // look at user table if a user with the nid exists, if exists, return error
  let query = `SELECT "nid" FROM "User" WHERE "nid" = $1`;
  try {
    const resultDB = await supabase.any(query, [nid]);
    
    console.log(resultDB);
    console.log(resultDB.length);
    
    if (resultDB.length > 0) {
      console.log("Hey bro, me got here");
      res
        .status(200)
        .json({ error: "You are already registered!" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: true, message: "Unknown database error" });
    return;
  }

  query = `INSERT INTO "User" ("nid", "name", "dob", "permanentAddress", "phone", "unionId", "email", "userType") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id"`;

  const accountTypeLower = accountType.toLowerCase();
  // execute the query and get the userId
  let userId;
  try {
    const result = await supabase.any(query, [
      nid,
      name,
      dob,
      permanentAddress,
      mobile,
      union,
      email,
      accountTypeLower,
    ]);
    userId = String(result[0].id);
    console.log("userId ===> " + userId);
    let hashedPassword = hashPassword(String(password) + String(userId));
    query = `UPDATE "User" SET "password" = $1 WHERE "id" = $2`;

    try {
      await supabase.any(query, [hashedPassword, userId]);

      // get the agentId from the UnionParishad table using the unionId

      try {
        const result = await supabase.any(
          `SELECT "agentId" FROM "UnionParishad" WHERE "id" = $1`,
          [union]
        );
        let agentId = String(result[0].agentId);
        console.log("agentId ===> " + agentId);

        switch (accountTypeLower) {
          case "farmer":
            try {
              await supabase.any(
                `INSERT INTO "Farmer" ("id", "farmerType", "agentId") VALUES ($1, $2, $3)`,
                [userId, farmerType, agentId]
              );
              res.status(200).json({
                success: true,
                message: "Farmer registration successful",
                redirectUrl: "/login",
              });
            } catch (error) {
              await deleteUserTableEntry(userId);
              console.log(error);
              res
                .status(500)
                .send({
                  error: true,
                  message: "Error inserting into Farmer table",
                });
            }
            break;
          case "sme":
            try {
              await supabase.any(
                `INSERT INTO "Sme" ("id", "agentId") VALUES ($1, $2)`,
                [userId, agentId]
              );
              res.status(200).json({
                success: true,
                message: "SME registration successful",
                redirectUrl: "/login",
              });
            } catch (error) {
              await deleteUserTableEntry(userId);
              console.log(error);
              res
                .status(500)
                .send({
                  error: true,
                  message: "Error inserting into SME table",
                });
            }
            break;
          case "vendor":
            try {
              await supabase.any(
                `INSERT INTO "Vendor" ("id", "agentId") VALUES ($1, $2)`,
                [userId, agentId]
              );
              res.status(200).json({
                success: true,
                message: "Vendor registration successful",
                redirectUrl: "/login",
              });
            } catch (error) {
              await deleteUserTableEntry(userId);
              console.log(error);
              res
                .status(500)
                .send({
                  error: true,
                  message: "Error inserting into Vendor table",
                });
            }
            break;
          default:
            await deleteUserTableEntry(userId);
            res.status(400).json({ message: "Invalid account type" });
            break;
        }
      } catch (error) {
        await deleteUserTableEntry(userId);
        console.log(error);
        res.status(500).send("Error fetching agentId");
      }
    } catch (error) {
      // delete the user from the User table
      await deleteUserTableEntry(userId);
      console.log(error);
      res.status(500).send("Error setting password");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error inserting into User table");
  }
});

router.route("/farmer").get(async (req, res) => {
  let locationMsUrl = await getLocationMsUrl();
  console.log(locationMsUrl);
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let divisions;
  try {
    divisions = await axios.get(String(locationMsUrl) + "/division");
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
  let locationMsUrl = await getLocationMsUrl();
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let divisions;
  try {
    divisions = await axios.get(String(locationMsUrl) + "/division");
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
  let locationMsUrl = await getLocationMsUrl();
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let divisions;
  try {
    divisions = await axios.get(String(locationMsUrl) + "/division");
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

router.route("/district").post(async (req, res) => {
  /* {
        "division": 1
    } */

  let locationMsUrl = await getLocationMsUrl();
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let districts;
  try {
    districts = await axios.post(String(locationMsUrl) + "/district", req.body);
    res.status(200).json(districts.data);
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
});

router.route("/upazilla").post(async (req, res) => {
  /* {
        "district": 1
    } */

  let locationMsUrl = await getLocationMsUrl();
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let upazillas;
  try {
    upazillas = await axios.post(String(locationMsUrl) + "/upazilla", req.body);
    res.status(200).json(upazillas.data);
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
});

router.route("/union").post(async (req, res) => {
  /* {
        "upazilla": 1
    } */

  let locationMsUrl = await getLocationMsUrl();
  if (locationMsUrl == null) {
    res.status(500).send("Error fetching data");
    return;
  }

  let unions;
  try {
    unions = await axios.post(String(locationMsUrl) + "/union", req.body);
    res.status(200).json(unions.data);
  } catch (error) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error fetching data");
    }
  }
});

module.exports = router;
