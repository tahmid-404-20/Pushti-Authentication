const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const router = express.Router();

router.use(express.json());
router.use(cors({ origin: "*" }));

router.route("/").get(async (req, res) => {
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

module.exports = router;
