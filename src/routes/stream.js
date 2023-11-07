const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

router.get("/streams", async (req, res) => {
  try {
    const streams = await executeQuery("SELECT * FROM ListStream");
    res.json(streams);
    console.log("res", streams);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
