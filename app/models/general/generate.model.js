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
  const existingNISNs = new Set();
  const existingEmails = new Set();

  for (let i = 0; i < 100; i++) {
    let nisn;
    let email;

    // Pastikan NISN unik
    do {
      nisn = randomNumber(10000000, 9999999999);
    } while (existingNISNs.has(nisn));
    existingNISNs.add(nisn);

    // Pastikan email unik
    do {
      email = faker.internet.email();
    } while (existingEmails.has(email));
    existingEmails.add(email);

    // Push ke array 'users' dengan data yang unik
    users.push([
      uuidv4(), // uid
      nisn, // nisn (unique)
      10, // unit_id
      faker.name.findName(), // full_name
      email, // email (unique)
      "628" + randomNumber(1000000000, 9999999999), // phone
      await bcrypt.hash("12345678", 10), // password
      1075, // class_id
      20091, // major_id
      530, // school_id
      faker.date.past(18, new Date(2000, 0, 1)).toISOString().slice(0, 10), // date_of_birth
      faker.address.streetAddress(), // address
      "ON", // status
      160, // role
      new Date(), // created_at
    ]);
  }

  const query =
    "INSERT INTO users (uid, nisn, unit_id, full_name, email, phone, password, class_id, major_id, school_id, date_of_birth, address, status, role, created_at) VALUES ?";

  db.query(query, [users], (err, results) => {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, results);
    }
  });
};


module.exports = Generate;
