const express = require("express");
const router = express.Router();
const { executeQuery, execPostgreQuery } = require("../services/db");

router.get("/stream/list", async (req, res) => {
  try {
    const streams = await execPostgreQuery(
      "SELECT * FROM streaming.list_stream ORDER BY id ASC"
    );
    res.json(streams);
  } catch (err) {
    res.status(400).json({ error: "Get Streams List Failed!" });
  }
});

router.get("/stream/:id", async (req, res) => {
  const streamId = req.params.id;
  try {
    const streams = await executeQuery(
      `SELECT * FROM list_stream WHERE id=${streamId}`
    );
    res.json(streams[0]);
  } catch (err) {
    res.status(400).json({ error: "Get Stream Failed!" });
  }
});

module.exports = router;
