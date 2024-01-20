const supabase =  require("./db.js");
const express = require("express");

const router = express.Router();

router.use(express.json());

router.route("/").post((req, res, next) => {
  
});

module.exports = router;
