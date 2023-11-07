const config = require('../config');
const mysql = require("mysql2/promise");

async function executeQuery(sql, params) {
  const connection = await mysql.createConnection(config);
  const [results] = await connection.execute(sql, params);
  connection.end();
  return results;
}

module.exports = {
    executeQuery,
}