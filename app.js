const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const userRouter = require("./src/routes/stream");
app.use("/", userRouter);

app.post("/encode-video", async (req, res) => {
  const publicFolderPath = path.join(__dirname, "public");
  const inputFilePath = path.join(
    publicFolderPath,
    "video/Sticking-Seafarer_by-Jeremy-Ross.mp4"
  );
  const outputHLSPath = path.join(
    publicFolderPath,
    "hls/Sticking-Seafarer_by-Jeremy-Ross"
  );
  const ffmpegCommand = `ffmpeg -i ${inputFilePath} -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 \
  -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
  -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 350k -bufsize:v:0 1200k -b:a:0 96k \
  -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
  -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:720p" \
  -hls_time 4  -hls_list_size 0 \
  -master_pl_name master.m3u8 \
   -hls_segment_filename "${outputHLSPath}/%v/segment%d.ts" ${outputHLSPath}/%v/index.m3u8`;
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "FFmpeg command failed" });
      return;
    }

    res.json({ message: "FFmpeg command executed successfully." });
  });
});

app.post("/encode-video-dash", async (req, res) => {
  const publicFolderPath = path.join(__dirname, "public");
  const inputFilePath = path.join(publicFolderPath, "video/totoro2.mp4");
  const outputDASHPath = path.join(publicFolderPath, "dash/totoro2");
  // const ffmpegCommand = `ffmpeg -i ${inputFilePath} \
  // -b:v:0 350k  -c:v:0 libx264 -filter:v:0 "scale=320:-1"  \
  // -b:v:2 3000k -c:v:1 libx264 -filter:v:2 "scale=1280:-1" \
  // -use_timeline 0 -use_template 1 -adaptation_sets "id=0,streams=v  id=1,streams=a" \
  //     -f dash ${outputDASHPath}/output.mpd`;
  const ffmpegCommand = `ffmpeg -re -i ${inputFilePath} -map 0 -map 0 -c:a aac -c:v libx264 \
  -b:v:0 800k -b:v:1 300k -s:v:1 320x170 -profile:v:1 baseline \
  -profile:v:0 main -bf 1 -keyint_min 120 -g 120 -sc_threshold 0 \
  -b_strategy 0 -ar:a:1 22050 -use_timeline 1 -use_template 1 \
  -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" \
  -f dash ${outputDASHPath}/output.mpd`;
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "FFmpeg command failed" });
      return;
    }

    console.log("FFmpeg command executed successfully.");
    res.json({ message: "FFmpeg command executed successfully." });
  });

  console.log("FFmpeg command", outputDASHPath, ffmpegCommand);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
