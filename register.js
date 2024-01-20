const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");
const crypto = require('crypto');
const fetch = require("node-fetch");

const router = express.Router();


router.use(express.json());
router.use(cors({ origin: "*" }));

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
  const { accountType, farmerType, nid, name, password, dob, address, mobile, union, email } = req.body;



  let query = `INSERT INTO "User" ("nid", "name", "password", "dob", "address", "mobile", "union", "email") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id"`;

});


router.route("/farmer").get(async (req, res) => {
  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await axios.get(
      String(process.env.locationMsURL) + "/division"
    );
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
  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await axios.get(
      String(process.env.locationMsURL) + "/division"
    );
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
  // get the divisions by hitting process.env.locationMsUrl + "/division" in get method
  let divisions;
  try {
    divisions = await axios.get(
      String(process.env.locationMsURL) + "/division"
    );
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

  // get the districts by hitting process.env.locationMsUrl + "/district" in post method
  let districts;
  try {
    districts = await axios.post(
      String(process.env.locationMsURL) + "/district",
      req.body
    );
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

  // get the upazillas by hitting process.env.locationMsUrl + "/upazilla" in post method
  let upazillas;
  try {
    upazillas = await axios.post(
      String(process.env.locationMsURL) + "/upazilla",
      req.body
    );
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

  // get the unions by hitting process.env.locationMsUrl + "/union" in post method
  let unions;
  try {
    unions = await axios.post(
      String(process.env.locationMsURL) + "/union",
      req.body
    );
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
