const db = require("../../config/db.config");

const Profile = function (data) {
  this.fullName = data.fullName;
};
Profile.findById = (fullName, result) => {
  let query = "SELECT * FROM users where 1=1 ";

  if (fullName) {
    query += ` and email LIKE '%${fullName}%'`;
  }

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};

module.exports = Profile;
