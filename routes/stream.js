const express = require("express");
const router = express.Router();
const { executeQuery } = require("../services/db");

router.get("/stream/list", async (req, res) => {
  try {
    const streams = await executeQuery("SELECT * FROM ListStream");
    res.json(streams);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
