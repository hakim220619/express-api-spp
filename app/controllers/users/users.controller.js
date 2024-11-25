const Users = require("../../models/users/users.model.js");
const verifyToken = require("../../config/tokenHandler");
// Create and Save a new Tutorial
exports.register = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Create a Tutorial
  const users = new Users({
    uid: req.body.uid,
    nik: req.body.nik,
    
    member_id: req.body.member_id,
    fullName: req.body.fullName,
    date_of_birth: req.body.date_of_birth,
    address: req.body.address,
    phone_number: req.body.phone_number,
  });

  // Save Tutorial in the database
  Users.create(users, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial.",
      });
    else res.send(data);
  });
};

// Retrieve all Tutorials from the database (with condition).
exports.findAll = verifyToken, (req, res, next) => {
  // console.log(verifyToken);
  // const fullName = req.query.fullName;

  // Users.getAll(fullName, (err, data) => {
  //   if (err)
  //     res.status(500).send({
  //       message:
  //         err.message || "Some error occurred while retrieving tutorials.",
  //     });
  //   else res.send(data);
  // });
};

// // Find a single Tutorial by Id
// exports.findOne = (req, res) => {
//   Tutorial.findById(req.params.id, (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `Not found Tutorial with id ${req.params.id}.`,
//         });
//       } else {
//         res.status(500).send({
//           message: "Error retrieving Tutorial with id " + req.params.id,
//         });
//       }
//     } else res.send(data);
//   });
// };

// // find all published Tutorials
// exports.findAllPublished = (req, res) => {
//   Tutorial.getAllPublished((err, data) => {
//     if (err)
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving tutorials.",
//       });
//     else res.send(data);
//   });
// };

// // Update a Tutorial identified by the id in the request
// exports.update = (req, res) => {
//   // Validate Request
//   if (!req.body) {
//     res.status(400).send({
//       message: "Content can not be empty!",
//     });
//   }

//   console.log(req.body);

//   Tutorial.updateById(req.params.id, new Tutorial(req.body), (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `Not found Tutorial with id ${req.params.id}.`,
//         });
//       } else {
//         res.status(500).send({
//           message: "Error updating Tutorial with id " + req.params.id,
//         });
//       }
//     } else res.send(data);
//   });
// };

// // Delete a Tutorial with the specified id in the request
// exports.delete = (req, res) => {
//   Tutorial.remove(req.params.id, (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `Not found Tutorial with id ${req.params.id}.`,
//         });
//       } else {
//         res.status(500).send({
//           message: "Could not delete Tutorial with id " + req.params.id,
//         });
//       }
//     } else res.send({ message: `Tutorial was deleted successfully!` });
//   });
// };

// // Delete all Tutorials from the database.
// exports.deleteAll = (req, res) => {
//   Tutorial.removeAll((err, data) => {
//     if (err)
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while removing all tutorials.",
//       });
//     else res.send({ message: `All Tutorials were deleted successfully!` });
//   });
// };
