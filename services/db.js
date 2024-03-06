const config = require('../config');
const mysql = require("mysql2/promise");
const { Pool } = require("pg");

async function executeQuery(sql, params) {
  const connection = await mysql.createConnection(config);
  const [results] = await connection.execute(sql, params);
  connection.end();
  return results;
}

// Create a new Pool instance with your database connection details
const pool = new Pool(config);

async function execPostgreQuery(sql, params) {
  try {
    const res = await pool.query(sql, params);
    console.log(res);
    return res.rows;
  } catch (err) {
    console.error("Error executing query", err);
    return [];
  }
}

module.exports = {
  executeQuery,
  execPostgreQuery,
};