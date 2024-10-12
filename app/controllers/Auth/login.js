const Login = require("../../models/Auth/login.model");
const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
const createHash = require("crypto");
exports.login = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  const users = new Login({
    email: req.body.email,
    password: req.body.password,
  });

  // Save Tutorial in the database
  Login.loginAction(users, (err, data) => {
    if (err != 200)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users.",
      });
    else res.send(data);
  });
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
  console.log(AccessToken);
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
