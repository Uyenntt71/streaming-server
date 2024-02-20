const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
const staticPath = path.join(__dirname, "public");

app.use(express.static(staticPath));

const userRouter = require("./routes/stream");
app.use("/", userRouter);

const userTV360 = require("./routes/tv360");
app.use("/tv360", userTV360);

app.post("/encode-video-hls", async (req, res) => {
  const fileName = req.body.name;

  const publicFolderPath = path.join(__dirname, "public");
  const inputFilePath = path.join(publicFolderPath, `video/${fileName}.mp4`);
  const outputHLSPath = path.join(publicFolderPath, `hls/${fileName}`);
  const watermarkPath = path.join(publicFolderPath, "LogoCDN.svg");

  createEmptyFolder(outputHLSPath);

  //Command to convert .mp4 to hls streams
  // const ffmpegCommand = `ffmpeg -i ${inputFilePath} \
  // -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 \
  // -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
  // -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 350k -bufsize:v:0 1200k -b:a:0 96k \
  // -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
  // -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:720p" \
  // -hls_time 4  -hls_list_size 0 \
  // -master_pl_name master.m3u8 \
  //  -hls_segment_filename "${outputHLSPath}/%v/segment%d.ts" ${outputHLSPath}/%v/index.m3u8`;

  //Command to add watermark and convert to hls streams
  const ffmpegCommand = `ffmpeg -i ${inputFilePath} \
-i ${watermarkPath} \
-filter_complex "[0:v:0]scale=w=640:h=360:flags=lanczos[v0]; \
[1:v]scale=w=28:h=30[watermark0]; \
[0:v:0]scale=w=854:h=480:flags=lanczos[v1]; \
[1:v]scale=w=51:h=55[watermark1]; \
[0:v:0]scale=w=1280:h=720:flags=lanczos[v2]; \
[1:v]scale=w=76:h=82[watermark2]; \
[0:v:0]scale=w=1920:h=1080:flags=lanczos[v3]; \
[1:v]scale=w=114:h=123[watermark3]; \
[v0][watermark0]overlay=10:10[ov0]; \
[v1][watermark1]overlay=10:10[ov1]; \
[v2][watermark2]overlay=10:10[ov2]; \
[v3][watermark3]overlay=10:10[ov3]" \
-map "[ov0]" -map 0:a:0? -c:v:0 libx264 -b:v:0 800k -b:a:0 64k -bufsize:v:0 1200k \
-map "[ov1]" -map 0:a:0? -c:v:0 libx264 -b:v:0 1400k -b:a:0 128k -bufsize:v:0 2100k \
-map "[ov2]" -map 0:a:0? -c:v:0 libx264 -b:v:0 2800k -b:a:0 192k -bufsize:v:0 4200k \
-map "[ov3]" -map 0:a:0? -c:v:0 libx264 -b:v:0 4500k -b:a:0 256k -bufsize:v:0 7500k \
-var_stream_map "v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p v:3,a:3,name:1080p" \
-hls_time 4 -hls_list_size 10 -start_number 1 -master_pl_name master.m3u8 \
-hls_segment_filename "${outputHLSPath}/%v/segment%d.ts" -f hls -hls_flags delete_segments ${outputHLSPath}/%v/index.m3u8`;

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
  const fileName = req.body.name;
  const publicFolderPath = path.join(__dirname, "public");
  const inputFilePath = path.join(publicFolderPath, `video/${fileName}.mp4`);
  const outputDASHPath = path.join(publicFolderPath, `dash/${fileName}`);
  const watermarkPath = path.join(publicFolderPath, "LogoCDN.svg");

  createEmptyFolder(outputDASHPath);


  const ffmpegCommand = `ffmpeg -re -i ${inputFilePath} -map 0:v:0 -map 0:a:0 \
-b:v:0 800k -profile:v:0 main \
-b:v:1 300k -s:v:1 320x170 -profile:v:1 baseline -ar:a:1 22050 \
-bf 1 -keyint_min 120 -g 120 -sc_threshold 0 -b_strategy 0 \
-use_timeline 1 -use_template 1 -window_size 5 \
-adaptation_sets "id=0,streams=v id=1,streams=a" \
-f dash ${outputDASHPath}/output.mpd`;

  // `ffmpeg -i ${inputFilePath} \
  //   -map 0:v:0 -map 0:v:0 -map 0:v:0 -map 0:a\?:0  \
  //   -b:v:0 350k  -c:v:0 libx264 -filter:v:0 "scale=320:-1"  \
  //   -b:v:1 1000k -c:v:1 libx264 -filter:v:1 "scale=640:-1"  \
  //   -b:v:2 3000k -c:v:2 libx264 -filter:v:2 "scale=1280:-1" \
  //   -use_timeline 0 -use_template 1 -adaptation_sets "id=0,streams=v  id=1,streams=a" \
  //       -f dash ${outputDASHPath}/output.mpd`;

  // const ffmpegCommand = `ffmpeg -re -i ${inputFilePath} -map 0 -map 0 -c:a aac -c:v libx264 \
  // -b:v:0 800k -b:v:1 300k -s:v:1 320x170 -profile:v:1 baseline \
  // -profile:v:0 main -bf 1 -keyint_min 120 -g 120 -sc_threshold 0 \
  // -b_strategy 0 -ar:a:1 22050 -use_timeline 1 -use_template 1 \
  // -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" \
  // -f dash ${outputDASHPath}/output.mpd`;

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
      res.status(400).json({ error: "FFmpeg command failed" });
      return;
    }

    console.log("FFmpeg command executed successfully.");
    res.json({ message: "FFmpeg command executed successfully." });
  });
});

function createEmptyFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  } else {
    deleteFolderContents(folderPath);
  }
}

function deleteFolderContents(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currPath = path.join(folderPath, file);
      if (fs.lstatSync(currPath).isDirectory()) {
        fs.rmSync(currPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(currPath);
      }
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
