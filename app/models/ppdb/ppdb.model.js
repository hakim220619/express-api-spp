const db = require("../../config/db.config");
const bcrypt = require("bcrypt");
// constructor
const Ppdb = function (data) {
  this.id = data.uid;
};

Ppdb.create = (newUsers, result) => {
  db.query("INSERT INTO class SET ?", newUsers, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Ppdb: ", { id: res.insertId, ...newUsers });
    result(null, { id: res.insertId, ...newUsers });
  });
};

Ppdb.update = (newUsers, result) => {
  db.query(
    "UPDATE calon_siswa SET ? WHERE id = ?",
    [newUsers, newUsers.id],
    (err, res) => {
      if (err) {
        console.error("Error: ", err);
        result(err, null);
        return;
      }
      if (res.affectedRows == 0) {
        // Not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("Updated User: ", { id: newUsers.id, ...newUsers });
      result(null, { id: newUsers.uid, ...newUsers });
    }
  );
};

Ppdb.listPpdb = (full_name, school_id, result) => {
  let query =
    "SELECT ROW_NUMBER() OVER () AS no, cs.*, u.unit_name, s.school_name  FROM calon_siswa cs, school s, unit u WHERE cs.school_id=s.id AND cs.unit_id=u.id";

  if (full_name) {
    query += ` AND cs.full_name like '%${full_name}%'`;
  }
  if (school_id) {
    query += ` AND cs.school_id = '${school_id}'`;
  }

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("users: ", res);
    result(null, res);
  });
};
Ppdb.delete = (uid, result) => {
  let query = `DELETE FROM calon_siswa WHERE id = '${uid}'`;
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log(`Deleted user with ID ${uid}`);
    result(null, res);
  });
};
Ppdb.detailPpdb = async (id, result) => {
  let query =
    "SELECT * from calon_siswa where id = '" +
    id +
    "'";
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res[0]);
  });
};

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};

Ppdb.verifikasiSiswaBaru = async (id, result) => {
  try {
    // Step 1: Select the student by id to get date_of_birth and nik
    let selectQuery = "SELECT date_of_birth, nik FROM calon_siswa WHERE id = ?";
    
    db.query(selectQuery, [id], async (err, res) => {
      if (err) {
        console.log("Error while selecting student: ", err);
        result(null, err);
        return;
      }

      if (res.length === 0) {
        console.log("Student not found with id: ", id);
        result({ message: "Student not found" }, null);
        return;
      }

      // Step 2: Extract the date_of_birth and nik from the selected student
      const { date_of_birth, nik } = res[0];

      // Step 3: Extract the year from date_of_birth
      const yearOfBirth = new Date(date_of_birth).getFullYear();

      // Step 4: Generate random numbers (between 1 and 5)
      const randomNumber = Math.floor(Math.random() * 5) + 1;

      // Step 5: Create the username using the random number, year of birth, and nik
      const username = `${randomNumber}${yearOfBirth}${nik}`;

      const randomPassword = generateRandomPassword();
      // Step 6: Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Step 7: Update username and hashed password for the student with the given id
      let updateQuery = "UPDATE calon_siswa SET username = ?, password = ? WHERE id = ?";
      
      db.query(updateQuery, [username, hashedPassword, id], (updateErr, updateRes) => {
        if (updateErr) {
          console.log("Error while updating student: ", updateErr);
          result(null, updateErr);
          return;
        }

        console.log("Updated student with id: ", {
          message: "Student updated successfully",
          id,
          username, // Return the newly created username
          password: randomPassword, // Return the hashed password
          date_of_birth,
          nik,
        });
        // Optionally, return the updated student data or a success message
        result(null, {
          message: "Student updated successfully",
          id,
          username, // Return the newly created username
          password: randomPassword, // Return the hashed password
          date_of_birth,
          nik,
        });
      });
    });
  } catch (error) {
    console.log("Error in verification process: ", error);
    result(null, error);
  }
};


module.exports = Ppdb;
