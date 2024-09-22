const db = require("../../config/db.config");
const faker = require("faker");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const Generate = function (data) {};


Generate.create = async (result) => {
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  const users = [];

  for (let i = 0; i < 200; i++) {
    users.push([
      2,
      uuidv4(),
      randomNumber(10000, 9999999),
      "KSP" + randomNumber(1000000, 9999999),
      faker.name.findName(),
      faker.internet.email(),
      faker.address.streetAddress(),
      await bcrypt.hash("12345678", 10),
      "2024-03-03",
      "4253452352342",
      "Verification",
      new Date(),
      4,
      'Banyumas',
      'SWASTA',
      'Islam',
      'Menikah',
      'KTP',
      randomNumber(1000000000, 999999999999),
      '6285797887722'
    ]);
  }
    // console.log(users);
  const query =
    "INSERT INTO users (company_id, uid, nik, member_id, fullName, email, address, password, date_of_birth,phone_number, status, created_at, role, place_of_birth, work, religion, marital_status, identity_type, no_identity, no_wa ) VALUES ?";
  db.query(query, [users], (err, results) => {   
    console.log(err);
     
    result(null, results);
  });
};


module.exports = Generate;
