const Ppdb = require("../../models/ppdb/ppdb.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// const baseUploadDir = "uploads/school/siswa_baru";
// if (!fs.existsSync(baseUploadDir)) {
//   fs.mkdirSync(baseUploadDir, { recursive: true });
// }

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const schoolId = req.body.school_id; // Get the school ID from the request body
//     const uploadPath = path.join(baseUploadDir, schoolId.toString()); // Construct the folder path

//     // Ensure the specific school directory exists
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//       console.log(`Directory created: ${uploadPath}`);
//     }

//     cb(null, uploadPath); // Callback with the destination folder
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Rename file with a unique identifier
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });
exports.createSettingPpdb = [
  upload.single("image"), // Middleware untuk menangani upload file tunggal
  async (req, res) => {
    try {
      // Validasi input request body
      const { school_id, unit_id, years, amount, status, address, url } =
        req.body;

      // Validasi wajib untuk unit_id, years, dan amount
      if (!unit_id || !years || !amount) {
        return res.status(400).send({
          message: "unit_id, years, dan amount tidak boleh kosong!",
        });
      }

      // Manipulasi URL: Mengganti spasi dengan tanda "-"
      const sanitizedUrl = url ? url.trim().replace(/\s+/g, "-") : null;

      // Cek apakah ada file gambar yang diupload
      const gambar = req.file ? req.file.filename : null; // Simpan nama file jika ada

      // Buat objek pengaturan PPDB baru
      const settingPpdb = {
        school_id,
        unit_id,
        years,
        amount,
        address,
        url: sanitizedUrl,
        status: status || "ON", // Default status ke "ON" jika tidak diisi
        image: gambar, // Gambar opsional
        created_at: new Date(), // Timestamp saat data dibuat
      };

      // Simpan data ke database menggunakan callback
      Ppdb.createSettingPpdb(settingPpdb, (err, data) => {
        if (err) {
          console.error("Error saat menyimpan ke database:", err);
          return res.status(500).send({
            message:
              err.message || "Terjadi kesalahan saat membuat pengaturan PPDB.",
          });
        }
        res.status(201).send({
          message: "Pengaturan PPDB berhasil dibuat.",
          data,
        });
      });
    } catch (error) {
      console.error("Error di server:", error);
      res.status(500).send({ message: "Terjadi kesalahan di server." });
    }
  },
];

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
exports.listSettingPpdb = (req, res, next) => {
  const unit_id = req.query.q;
  const school_id = req.query.school_id;

  Ppdb.listSettingPpdb(unit_id, school_id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};




// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads/school/siswa_baru'));
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Menyimpan file dengan nama unik
  }
});

// Pengaturan batas ukuran file (diatur lebih dari 1 MB)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran 5 MB
});

// Fungsi untuk mengirim data siswa baru
exports.sendDataSiswaBaruAll = [
  upload.fields([
    { name: "kartuKeluarga", maxCount: 1 },
    { name: "akteLahir", maxCount: 1 },
    { name: "ktpOrangtua", maxCount: 1 },
    { name: "ijasah", maxCount: 1 },
  ]),
  async (req, res) => {
    // Validasi permintaan
    if (!req.body) {
      return res.status(400).send({ message: "Content cannot be empty!" });
    }

    // Daftar field yang wajib ada
    const requiredFields = [
      "id", "fullName", "gender", "nik", "nisn",
      "birth_place_date", "birth_date", "address",
      "fatherName", "motherName"
    ];

    // Cek apakah semua field yang diperlukan ada dan tidak null
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({ message: `${field} cannot be empty!` });
      }
    }

    // Ekstrak data siswa dari body request
    const studentData = {
      cs_id: req.body.id,
      full_name: req.body.fullName,
      nick_name: req.body.nick_name,
      gender: req.body.gender,
      nik: req.body.nik,
      nisn: req.body.nisn,
      birth_place_date: req.body.birth_place_date,
      birth_date: req.body.birth_date,
      birth_cert_no: req.body.birth_cert_no,
      address: req.body.address,
      religion: req.body.religion,
      rt: req.body.rt,
      rw: req.body.rw,
      dusun: req.body.dusun,
      kecamatan: req.body.kecamatan,
      school: req.body.school,
      siblings: req.body.siblings,
      transportation: req.body.transportation,
      travel_hours: req.body.travelHours,
      travel_minutes: req.body.travelMinutes,
      distance_in_km: req.body.distanceInKm,
      distance_to_school: req.body.distanceToSchool,
      height: req.body.height,
      weight: req.body.weight,
      mobile_phone: req.body.mobilePhone,
      phone: req.body.phone,
      home_phone: req.body.homePhone,
      email: req.body.email,
      kps_number: req.body.kpsNumber,
      kps_receiver: req.body.kpsReceiver,
      father_name: req.body.fatherName,
      father_nik: req.body.fatherNik,
      father_birth_year: req.body.fatherBirthYear,
      father_education: req.body.fatherEducation,
      father_job: req.body.fatherJob,
      father_income: parseInt(req.body.fatherIncome.replace(/[Rp.]/g, ""), 10),
      mother_name: req.body.motherName,
      mother_nik: req.body.motherNik,
      mother_birth_year: req.body.motherBirthYear,
      mother_education: req.body.motherEducation,
      mother_job: req.body.motherJob,
      mother_income: parseInt(req.body.motherIncome.replace(/[Rp.]/g, ""), 10),
      guardian_name: req.body.guardianName || "",
      guardian_nik: req.body.guardianNik || "",
      guardian_birth_year: req.body.guardianBirthYear || "",
      guardian_education: req.body.guardianEducation || "",
      guardian_job: req.body.guardianJob || "",
      guardian_income: req.body.guardianIncome
        ? parseInt(req.body.guardianIncome.replace(/[Rp.]/g, ""), 10)
        : null,
      kartu_keluarga: req.files.kartuKeluarga ? req.files.kartuKeluarga[0].path : req.body.kartuKeluarga,
      akte_lahir: req.files.akteLahir ? req.files.akteLahir[0].path : req.body.akteLahir,
      ktp_orangtua: req.files.ktpOrangtua ? req.files.ktpOrangtua[0].path : req.body.ktpOrangtua,
      ijasah: req.files.ijasah ? req.files.ijasah[0].path : req.body.ijasah,
      created_at: new Date(),
    };

    try {
      // Simpan data siswa ke database
      Ppdb.sendDataSiswaBaruAll(studentData, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || "Some error occurred while saving the student data.",
          });
        }
        res.send(data);
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
exports.deleteSettingPpdb = (req, res) => {
  const uid = req.body.data;

  Ppdb.deleteSettingPpdb(uid, (err, data) => {
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
exports.reviewAndMasukanBySiswa = (req, res, next) => {
  const id = req.body.id;
  const review = req.body.review;
  Ppdb.reviewAndMasukanBySiswa(id, review, (err, data) => {
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
exports.tolakSiswaBaru = (req, res, next) => {
  const id = req.body.id;
  Ppdb.tolakSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.reloadPaymentSiswaBaru = (req, res, next) => {
  const id = req.body.id;

  Ppdb.reloadPaymentSiswaBaru(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
