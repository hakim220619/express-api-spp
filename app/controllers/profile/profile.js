const Profile = require("../../models/profile/profile.model");


// Retrieve all Tutorials from the database (with condition).
exports.findAll = (req, res, next) => {
  const fullName = req.body.fullName;
// console.log(fullName);
  Profile.findById(fullName, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};