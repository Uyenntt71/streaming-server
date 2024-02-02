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

router.get("/stream/:id", async (req, res) => {
  const streamId = req.params.id;
  try {
    const streams = await executeQuery(
      `SELECT * FROM ListStream WHERE id=${streamId}`
    );
    res.json(streams[0]);
  } catch (err) {
    res.status(400).json({ error: "Get stream fail" });
  }
});

module.exports = router;
