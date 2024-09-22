const Register = require("../../models/Auth/register.model");
const bcrypt = require("bcrypt");
// Create and Save a new Tutorial
exports.register = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  const saltRounds = 10;
  // Create a Tutorial
  const users = new Register({
    uid: req.body.uid,
    nik: req.body.nik,
    
    member_id: req.body.member_id,
    fullName: req.body.fullName,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 60),
    date_of_birth: req.body.date_of_birth,
    address: req.body.address,
    phone_number: req.body.phone_number,
  });

  // Save Tutorial in the database
  Register.create(users, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Registers.",
      });
    else res.send(data);
  });
};

// Retrieve all Tutorials from the database (with condition).
exports.findAll = (req, res) => {
  const fullName = req.query.fullName;

  Users.getAll(fullName, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
