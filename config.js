require("dotenv").config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  // host: "127.0.0.1",
  // port: 3306,
  // user: "root",
  // password: "root",
  // database: "streaming",
  connectTimeout: 60000,
  ssl: true,
};
module.exports = config;
