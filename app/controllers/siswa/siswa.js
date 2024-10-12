const Siswa = require("../../models/siswa/siswa.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const baseUploadDir = "uploads/school/siswa";
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body);

    const schoolId = req.body.school_id; // Get the school ID from the request body
    const uploadPath = path.join(baseUploadDir, schoolId.toString()); // Construct the folder path

    // Ensure the specific school directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Directory created: ${uploadPath}`);
    }

    cb(null, uploadPath); // Callback with the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Rename file with a unique identifier
  },
});

const upload = multer({ storage: storage });

// Retrieve all Siswa from the database with conditions
exports.listSiswa = (req, res, next) => {
  const fullName = req.query.q;
  const major = req.query.major;
  const clas = req.query.clas;
  const school_id = req.query.school_id;
  const unit_id = req.query.unit_id;

  Siswa.listSiswa(fullName, school_id, major, clas, unit_id, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    }
    res.send(data);
  });
};

// Create new Siswa
exports.createSiswa = [
  upload.single("gambar"), // Middleware for handling file upload
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      nisn,
      unit_id,
      full_name,
      email,
      phone,
      password,
      school_id,
      status,
      major_id,
      class_id,
      address,
      date_of_birth,
    } = req.body;

    try {
      // Create new siswa object
      const siswa = new Siswa({
        uid: uuidv4(),
        nisn: nisn,
        unit_id,
        school_id: school_id,
        full_name: full_name.toUpperCase(),
        email: email,
        address: address,
        phone: phone,
        major_id: major_id,
        class_id: class_id,
        password: await bcrypt.hash(password, 10),
        role: 160,
        created_by: req.body.created_by || "system",
        status: status || "ON",
        created_at: new Date(),
        date_of_birth: date_of_birth,
        image: req.file ? req.file.filename : null, // Store file name if uploaded
      });

      // Save siswa to the database
      Siswa.create(siswa, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Siswa.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      console.error("Error creating Siswa:", error);
      res.status(500).send({ message: "Error creating Siswa" });
    }
  },
];
function generateNoRegistrasi() {
  const characters = '0123456789';
  let result = '';
  const length = 6; // Maksimal 8 karakter
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
exports.registerSiswa = [
  upload.none(), // Middleware for handling file upload
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      school_id,
      nik,
      unit_id, // Unit field
      full_name,
      email,
      phone,
      date_of_birth
    } = req.body;

    try {
      // Create new siswa object
      const siswa = {
        school_id,
        no_registrasi: 'LPIH' +'-'+ generateNoRegistrasi(),
        nik: nik,
        unit_id,
        full_name: full_name.toUpperCase(),
        email: email,
        phone: phone,
        status: 'Registered',
        role: 220,
        date_of_birth: date_of_birth,
        created_at: new Date()
      };

      // Save siswa to the database
      Siswa.registerSiswa(siswa, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || "Some error occurred while creating the Siswa.",
          });
        }
        res.send(data);
      });
    } catch (error) {
      console.error("Error creating Siswa:", error);
      res.status(500).send({ message: "Error creating Siswa" });
    }
  },
];


// Update existing Siswa
// Update existing Siswa
exports.updateSiswa = [
  upload.single("image"), // Middleware for handling file upload during update
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      // Retrieve the existing siswa details to get the previous image
      Siswa.detailSiswa(req.body.uid, async (err, existingSiswa) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message ||
              "Some error occurred while retrieving the Siswa details.",
          });
        }

        // Prepare the updated siswa data
        const siswa = {
          uid: req.body.uid,
          nisn: req.body.nisn,
          full_name: req.body.full_name.toUpperCase(),
          email: req.body.email,
          date_of_birth: req.body.date_of_birth,
          address: req.body.address,
          phone: req.body.phone,
          unit_id: req.body.unit_id,
          class_id: req.body.class_id,
          major_id: req.body.major_id,
          school_id: req.body.school_id,
          status: req.body.status,
          updated_by: req.body.updated_by,
          updated_at: new Date(),
          role: 160,
          image: req.file ? req.file.filename : existingSiswa.image, // Use new file or retain the old one
        };

        // If a new image is uploaded, delete the old image from storage
        if (req.file && existingSiswa.image) {
          const previousImagePath = path.join(
            baseUploadDir,
            existingSiswa.school_id.toString(),
            existingSiswa.image
          );
          fs.unlink(previousImagePath, (err) => {
            if (err) {
              console.error(
                `Failed to delete old image file: ${previousImagePath}`,
                err
              );
            } else {
              console.log(
                `Successfully deleted old image file: ${previousImagePath}`
              );
            }
          });
        }

        // Update the siswa in the database
        Siswa.update(siswa, (err, data) => {
          if (err) {
            return res.status(500).send({
              message:
                err.message || "Some error occurred while updating the Siswa.",
            });
          }
          res.send({ message: "Siswa updated successfully!", data });
        });
      });
    } catch (error) {
      console.error("Error updating Siswa:", error);
      res.status(500).send({ message: "Error updating Siswa" });
    }
  },
];

// Delete a Siswa
// Delete a Siswa
exports.delete = (req, res) => {
  const uid = req.body.data;

  // Retrieve the siswa details to get the image filename before deletion
  Siswa.detailSiswa(uid, (err, siswaData) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving the Siswa details for deletion.",
      });
    }

    // Delete the siswa from the database
    Siswa.delete(uid, (err, data) => {
      if (err) {
        return res.status(500).send({
          message:
            err.message || "Some error occurred while deleting the Siswa.",
        });
      }

      // If the siswa has an image, attempt to delete it from the filesystem
      if (siswaData.image) {
        const imagePath = path.join(
          baseUploadDir,
          siswaData.school_id.toString(),
          siswaData.image
        );

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete image file: ${imagePath}`, err);
          } else {
            console.log(`Successfully deleted image file: ${imagePath}`);
          }
        });
      }

      res.send({ message: "Siswa deleted successfully!", data });
    });
  });
};

// Get details of a specific Siswa
exports.detailSiswa = (req, res, next) => {
  const uid = req.body.uid;

  Siswa.detailSiswa(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving the Siswa details.",
      });
    }
    res.send(data);
  });
};
const XLSX = require("xlsx");
const { log } = require("util");
const dataupload = multer({ dest: "uploads/" });
exports.uploadSiswa = [
  dataupload.single("file"), // Middleware for handling file upload
  async (req, res, next) => {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send({
        status: 'error',
        message: "No file uploaded. Please upload an Excel file.",
      });
    }

    const school_id = req.body.school_id;

    // Validate school_id
    if (!school_id) {
      return res.status(400).send({
        status: 'error',
        message: "school_id is required.",
      });
    }

    try {
      // Read the uploaded Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0]; // Get the first sheet name
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet to JSON
      const dataRows = XLSX.utils.sheet_to_json(sheet);

      // Initialize a counter for successfully processed records
      let successfulRecords = 0;
      let failedRecords = [];

      // Loop through each row of data and save to the database
      for (const row of dataRows) {
        try {
          await Siswa.uploadSiswa({
            school_id,
            ...row,
          });
          successfulRecords++; // Increment success count
        } catch (error) {
          // Capture failed record and the error message
          failedRecords.push({
            row: row,
            error: error.message
          });
        }
      }

      // Construct the response message
      const responseMessage = {
        status: 'success',
        message: "File uploaded successfully.",
        totalRecords: dataRows.length,
        successfulRecords: successfulRecords,
        failedRecords: failedRecords.length,
        failedDetails: failedRecords.length > 0 ? failedRecords : undefined, // Only include if there are failures
      };

      // Send success response
      res.status(200).send(responseMessage);
    } catch (err) {
      // Handle errors from the upload function
      res.status(500).send({
        status: 'error',
        message:
          err.message ||
          "Some error occurred while processing the Siswa details.",
      });
    }
  },
];
