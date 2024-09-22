const mysql = require("mysql");
require('dotenv').config();
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
var connection = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: '3306'
});

module.exports = connection;

// const mysql = require("mysql");
// const dotenv = require("dotenv");
// const connection = () => {
//   const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = dotenv.process.env;
//   return mysql.createPool({
//       host: DB_HOST,
//       user: DB_USER,
//       password: DB_PASSWORD,
//       database: DB_NAME,
//   });
// };

// export default connection().promise();

