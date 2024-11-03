const Login = require("../../models/Auth/login.model");
const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const { generateToken } = require("../../config/tokenHandler");
const { insertMmLogs } = require("../../helpers/helper");
require('dotenv').config();
exports.login = async (req, res) => {

  const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  const dbm = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: '3306',
  });
  try {
    // Validate if email/NISN and password are provided
    const { emailOrnisn, password } = req.body;
    if (!emailOrnisn || !password) {
      return res.status(400).send({
        message: "Email atau NISN dan password harus diisi!",
      });
    }

    let query;
    let queryValue;

    // Check if the input is email or NISN
    const isEmail = emailOrnisn.includes("@");

    if (isEmail) {
      query = `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name, a.logo, a.copy_right, s.school_name 
               FROM users u
               JOIN role r ON u.role = r.id
               JOIN aplikasi a ON u.school_id = a.school_id
               JOIN school s ON u.school_id = s.id
               WHERE u.email = ?`;
      queryValue = emailOrnisn;
    } else {
      query = `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name, a.logo, a.copy_right, s.school_name 
               FROM users u
               JOIN role r ON u.role = r.id
               JOIN aplikasi a ON u.school_id = a.school_id
               JOIN school s ON u.school_id = s.id
               WHERE u.nisn = ?`;
      queryValue = emailOrnisn;
    }

    // Query database to find the user
    const [users] = await dbm.query(query, [queryValue]);

    if (users.length === 0) {
      return res.status(404).send({
        message: "Email atau NISN tidak terdaftar!",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }

    // Generate token and store it
    const accessToken = generateToken({ data: user.id });
    const tokenData = [
      "AppModelsUser",
      user.id,
      "authToken",
      accessToken,
      '["*"]',
      null,
      null,
      new Date(),
    ];

    await dbm.query(
      `INSERT INTO personal_access_tokens 
       (tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      tokenData
    );

    // Log the activity
    const logData = {
      school_id: user.school_id,
      user_id: user.id,
      activity: "loginAction",
      detail: `Login Berhasil dengan ID ${user.id} dan Nama ${user.full_name}`,
      action: "Insert",
      status: true,
    };

    await insertMmLogs(logData);

    // Send response
    res.status(200).send({
      accessToken,
      refreshToken: accessToken,
      userData: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Internal Server Error.",
    });
  }
};

exports.loginSiswaBaru = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  const users = {
    username: req.body.username,
    password: req.body.password,
  };

  // Save Tutorial in the database
  Login.loginSiswaBaruAction(users, (err, data) => {
    if (err != 200)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users.",
      });
    else res.send(data);
  });
};
exports.checklogin = async (req, res) => {
  const AccessToken = req.headers["authorization"];
  Login.checklogin(AccessToken, (err, data) => {
    console.log(err);

    if (err != 200)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ChekLogin.",
      });
    else res.status(200).send(data);
  });
};
exports.refreshToken = async (req, res) => {
  const AccessToken = req.headers["authorization"];
  Login.checklogin(AccessToken, (err, data) => {
    console.log(data);

    if (err != 200)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ChekLogin.",
      });
    else res.status(200).send(data);
  });
};
exports.logout = async (req, res) => {
  const AccessToken = req.headers["authorization"];
  Login.logout(AccessToken, (err, data) => {

    if (err != 200)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ChekLogin.",
      });
    else res.status(200).send(data);
  });
};
