const db = require("../../config/db.config");
// constructor
const Register = function (data) {
  this.uid = data.uid;
  this.nik = data.nik;
  this.nta = data.nta;
  this.member_id = data.member_id;
  this.fullName = data.fullName;
  this.email = data.email;
  this.password = data.password;
  this.date_of_birth = data.date_of_birth;
  this.address = data.address;
  this.phone_number = data.phone_number;
  this.status = 'Verification';
  this.created_at = new Date();
};

Register.create = (newRegisters, result) => {
    db.query("INSERT INTO users SET ?", newRegisters, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Users: ", { id: res.insertId, ...newRegisters });
    result(null, { id: res.insertId, ...newRegisters });
  });
};

module.exports = Register;