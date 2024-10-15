const Ppdb = require("../../models/ppdb/ppdb.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadDir = "uploads/school/siswa_baru";
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

// Retrieve all Admins from the database with conditions
exports.listPpdb = (req, res, next) => {
  const full_name = req.query.q;
  const school_id = req.query.school_id;

  Ppdb.listPpdb(full_name, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};


exports.sendDataSiswaBaruAll = [
  upload.fields([
    { name: 'kartuKeluarga', maxCount: 1 },
    { name: 'akteLahir', maxCount: 1 },
    { name: 'ktpOrangtua', maxCount: 1 },
    { name: 'ijasah', maxCount: 1 },
  ]),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const {
      id,
      fullName,
      nick_name,
      gender,
      nik,
      nisn,
      birth_place_date,
      birth_date,
      birth_cert_no,
      address,
      religion,
      rt,
      rw,
      dusun,
      kecamatan,
      school,
      siblings,
      transportation,
      travelHours,
      travelMinutes,
      distanceInKm,
      distanceToSchool,
      height,
      weight,
      mobilePhone,
      phone,
      homePhone,
      email,
      kpsNumber,
      kpsReceiver,
      fatherName,
      fatherNik,
      fatherBirthYear,
      fatherEducation,
      fatherJob,
      fatherIncome,
      motherName,
      motherNik,
      motherBirthYear,
      motherEducation,
      motherJob,
      motherIncome,
      guardianName,
      guardianNik,
      guardianBirthYear,
      guardianEducation,
      guardianJob,
      guardianIncome,
    } = req.body;
console.log(req.body);

    // Extract file paths from multer
    const files = req.files;
    const kartuKeluarga = files.kartuKeluarga ? files.kartuKeluarga[0].path : null;
    const akteLahir = files.akteLahir ? files.akteLahir[0].path : null;
    const ktpOrangtua = files.ktpOrangtua ? files.ktpOrangtua[0].path : null;
    const ijasah = files.ijasah ? files.ijasah[0].path : null;

    try {
      // Create a new student data object
      const studentData = {
        cs_id: id,
        full_name: fullName,
        nick_name: nick_name,
        gender: gender,
        nik: nik,
        nisn: nisn,
        birth_place_date: birth_place_date,
        birth_date: birth_date,
        birth_cert_no: birth_cert_no,
        address: address,
        religion: religion,
        rt: rt,
        rw: rw,
        dusun: dusun,
        kecamatan: kecamatan,
        school: school,
        siblings: siblings,
        transportation: transportation,
        travel_hours: travelHours,
        travel_minutes: travelMinutes,
        distance_in_km: distanceInKm,
        distance_to_school: distanceToSchool,
        height: height,
        weight: weight,
        mobile_phone: mobilePhone,
        phone: phone,
        home_phone: homePhone,
        email: email,
        kps_number: kpsNumber,
        kps_receiver: kpsReceiver,
        father_name: fatherName,
        father_nik: fatherNik,
        father_birth_year: fatherBirthYear,
        father_education: fatherEducation,
        father_job: fatherJob,
        father_income: parseInt(fatherIncome.replace(/[Rp.]/g, ""), 10),
        mother_name: motherName,
        mother_nik: motherNik,
        mother_birth_year: motherBirthYear,
        mother_education: motherEducation,
        mother_job: motherJob,
        mother_income: parseInt(motherIncome.replace(/[Rp.]/g, ""), 10),
        guardian_name: guardianName === 'undefined' ? '' : guardianName,
        guardian_nik: guardianNik === 'undefined' ? '' : guardianNik,
        guardian_birth_year: guardianBirthYear === 'undefined' ? '' : guardianBirthYear,
        guardian_education: guardianEducation === 'undefined' ? '' : guardianEducation,
        guardian_job: guardianJob === 'undefined' ? '' : guardianJob,
        guardian_income: guardianIncome
          ? isNaN(parseInt(guardianIncome.replace(/[Rp.]/g, ""), 10))
            ? null
            : parseInt(guardianIncome.replace(/[Rp.]/g, ""), 10)
          : null,
        created_at: new Date(),
      };

      // Only add document paths if they are not null
      if (kartuKeluarga) studentData.kartu_keluarga = kartuKeluarga;
      if (akteLahir) studentData.akte_lahir = akteLahir;
      if (ktpOrangtua) studentData.ktp_orangtua = ktpOrangtua;
      if (ijasah) studentData.ijasah = ijasah;

      // Save the student data to the database
      Ppdb.sendDataSiswaBaruAll(studentData, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message ||
              "Some error occurred while saving the student data.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error saving student data" });
    }
  },
];



// Update existing Admin
exports.updatePpdb = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const ppdb = {
        id: req.body.data.id,
        nik: req.body.data.nik,
        email: req.body.data.email,
        full_name: req.body.data.full_name,
        phone: req.body.data.phone,
        unit_id: req.body.data.unit_id,
        status: req.body.data.status,
        date_of_birth: req.body.data.date_of_birth,
        updated_at: new Date(),
      };

      Ppdb.update(ppdb, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Ppdb.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Ppdbs" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Ppdb.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailPpdb = (req, res, next) => {
  const id = req.body.id;

  Ppdb.detailPpdb(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailSiswaBaru = (req, res, next) => {
  const id = req.body.uid;

  Ppdb.detailSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailCalonSiswaBaru = (req, res, next) => {
  const id = req.body.uid;
  console.log(id);

  Ppdb.detailCalonSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.verifikasiSiswaBaru = (req, res, next) => {
  const id = req.body.id;
  Ppdb.verifikasiSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.terimaSiswaBaru = (req, res, next) => {
  const id = req.body.id;
  Ppdb.terimaSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
