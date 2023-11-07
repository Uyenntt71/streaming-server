const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const userRouter = require('./routes/stream');
app.use('/', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
