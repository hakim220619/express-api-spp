const Ppdb = require("../../models/ppdb/ppdb.model.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../config/db.config");

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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
exports.createSettingPpdb = [
  upload.single("image"), // Middleware untuk menangani upload file tunggal
  async (req, res) => {
    try {
      // Validasi input request body
      const {
        school_id,
        unit_id,
        years,
        amount,
        status,
        address,
        url,
        target,
      } = req.body;

      // Validasi wajib untuk unit_id, years, dan amount
      if (!unit_id || !years || !amount) {
        return res.status(400).send({
          message: "unit_id, years, dan amount tidak boleh kosong!",
        });
      }

      // Cek apakah ada file gambar yang diupload
      const gambar = req.file ? req.file.filename : null; // Simpan nama file jika ada

      // Buat objek pengaturan PPDB baru
      const settingPpdb = {
        school_id,
        unit_id,
        years,
        amount,
        address,
        target,
        url: url,
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

const baseUploadDirV1 = "uploads/school/siswa_baru";
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer setup for file uploads
const storageV1 = multer.diskStorage({
  destination: function (req, file, cb) {
    const schoolId = req.body.school_id; // Get the school ID from the request body
    const uploadPath = path.join(baseUploadDirV1, schoolId.toString()); // Construct the folder path

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

const uploadV1 = multer({ storage: storageV1 });

exports.sendDataSiswaBaruAll = [
  uploadV1.fields([
    { name: "kartuKeluarga", maxCount: 1 },
    { name: "akteLahir", maxCount: 1 },
    { name: "ktpOrangtua", maxCount: 1 },
    { name: "ijasah", maxCount: 1 },
    { name: "rapor", maxCount: 1 },
    { name: "passFotoSiswa", maxCount: 1 },
  ]),
  async (req, res) => {
    // Validate request payload
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }
// console.log(req.body);

    // List of required fields
    const requiredFields = [
      "id",
      "fullName",
      "gender",
      "nik",
      "nisn",
      "birth_place_date",
      "birth_date",
      "address",
      "fatherName",
      "motherName",
    ];

    // Check if all required fields are present and non-null
    // for (const field of requiredFields) {
    //   if (!req.body[field]) {
    //     return res.status(400).send({
    //       message: `${field} cannot be empty!`,
    //     });
    //   }
    // }

    // Function to handle potentially invalid values
    const handleInvalid = (value) => {
      if (value === "undefined" || value === undefined || value === NaN) {
        return '';
      }
      return value;
    };

    // Function to handle potentially invalid numeric values (e.g., income fields)
    const parseIncome = (value) => {
      const num = parseInt(value.replace(/[Rp.]/g, ""), 10);
      return isNaN(num) ? null : num;
    };

    // Extract file paths from multer
    const files = req.files;

    const studentData = {
      cs_id:  handleInvalid(req.body.id),
      full_name: handleInvalid(req.body.fullName),
      nick_name: handleInvalid(req.body.nick_name),
      gender: handleInvalid(req.body.gender),
      nik: handleInvalid(req.body.nik),
      nisn: handleInvalid(req.body.nisn),
      birth_place_date: handleInvalid(req.body.birth_place_date),
      birth_date: handleInvalid(req.body.birth_date),
      birth_cert_no: handleInvalid(req.body.birth_cert_no),
      address: handleInvalid(req.body.address),
      religion: handleInvalid(req.body.religion),
      rt: handleInvalid(req.body.rt),
      rw: handleInvalid(req.body.rw),
      dusun: handleInvalid(req.body.dusun),
      kecamatan: handleInvalid(req.body.kecamatan),
      school: handleInvalid(req.body.school),
      siblings: handleInvalid(req.body.siblings),
      transportation: handleInvalid(req.body.transportation),
      travel_hours: handleInvalid(req.body.travelHours),
      travel_minutes: handleInvalid(req.body.travelMinutes),
      distance_in_km: handleInvalid(req.body.distanceInKm),
      distance_to_school: handleInvalid(req.body.distanceToSchool),
      height: handleInvalid(req.body.height),
      weight: handleInvalid(req.body.weight),
      mobile_phone: handleInvalid(req.body.mobilePhone),
      phone: handleInvalid(req.body.phone),
      home_phone: handleInvalid(req.body.homePhone),
      email: handleInvalid(req.body.email),
      kps_number: handleInvalid(req.body.kpsNumber),
      kps_receiver: handleInvalid(req.body.kpsReceiver),
      father_name: handleInvalid(req.body.fatherName),
      father_nik: handleInvalid(req.body.fatherNik),
      father_birth_year: handleInvalid(req.body.fatherBirthYear),
      father_education: handleInvalid(req.body.fatherEducation),
      father_job: handleInvalid(req.body.fatherJob),
      father_income: handleInvalid(req.body.fatherIncome),
      mother_name: handleInvalid(req.body.motherName),
      mother_nik: handleInvalid(req.body.motherNik),
      mother_birth_year: handleInvalid(req.body.motherBirthYear),
      mother_education: handleInvalid(req.body.motherEducation),
      mother_job: handleInvalid(req.body.motherJob),
      mother_income: handleInvalid(req.body.motherIncome),
      guardian_name: handleInvalid(req.body.guardianName),
      guardian_nik: handleInvalid(req.body.guardianNik),
      guardian_birth_year: handleInvalid(req.body.guardianBirthYear),
      guardian_education: handleInvalid(req.body.guardianEducation),
      guardian_job: handleInvalid(req.body.guardianJob),
      guardian_income: handleInvalid(req.body.guardianIncome),
      kartu_keluarga: files.kartuKeluarga ? files.kartuKeluarga[0].path : handleInvalid(req.body.kartuKeluarga),
      akte_lahir: files.akteLahir ? files.akteLahir[0].path : handleInvalid(req.body.akteLahir),
      ktp_orangtua: files.ktpOrangtua ? files.ktpOrangtua[0].path : handleInvalid(req.body.ktpOrangtua),
      ijasah: files.ijasah ? files.ijasah[0].path : handleInvalid(req.body.ijasah),
      rapor: files.rapor ? files.rapor[0].path : handleInvalid(req.body.rapor),
      passFotoSiswa: files.passFotoSiswa ? files.passFotoSiswa[0].path : handleInvalid(req.body.passFotoSiswa),
      registrantType: handleInvalid(req.body.registrantType),
      placement: handleInvalid(req.body.placement),
      lastEducation: handleInvalid(req.body.lastEducation),
      graduationYear: handleInvalid(req.body.graduationYear),
      schoolOrigin: handleInvalid(req.body.schoolOrigin),
      continuedStudy: handleInvalid(req.body.continuedStudy),
      lastClass: handleInvalid(req.body.lastClass),
      lastSchoolName: handleInvalid(req.body.lastSchoolName),
      graduationYearFromLastSchool: handleInvalid(req.body.graduationYearFromLastSchool),
      created_at: new Date(),
    };

    try {
      // Save student data to database
      // Uncomment and modify the following line according to your DB handling code
      Ppdb.sendDataSiswaBaruAll(studentData, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || "Some error occurred while saving the student data.",
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

exports.updatePpdbSetting = [
  upload.single("image"), // Menggunakan upload.single untuk menangani upload file
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const ppdbId = req.body.id; // Mengambil id dari req.body

      // Kueri untuk mengambil data PPDB yang ada
      let query = "SELECT * FROM setting_ppdb WHERE id = '" + ppdbId + "'";
      db.query(query, (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(500).send({ message: "Error retrieving PPDB." });
        }

        const existingPpdb = result[0]; // Ambil data PPDB yang ada

        // Jika data PPDB tidak ditemukan, kirim respons error
        if (!existingPpdb) {
          return res.status(404).send({ message: "PPDB not found." });
        }

        const ppdb = {
          id: ppdbId,
          unit_id: req.body.unit_id,
          target: req.body.target,
          years: req.body.years,
          amount: req.body.amount,
          status: req.body.status,
          address: req.body.address,
          updated_at: new Date(),
        };

        // Jika ada file gambar yang di-upload
        if (req.file) {
          // Hapus file gambar lama jika ada
          const oldImagePath = path.resolve(
            "uploads",
            "school",
            "siswa_baru",
            existingPpdb.school_id.toString(),
            existingPpdb.image
          );

          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Failed to delete old image:", err);
            }
          });

          ppdb.image = req.file.filename; // Menyimpan path gambar baru
        }

        // Update PPDB dengan data baru
        Ppdb.updatePpdbSetting(ppdb, (err, data) => {
          if (err) {
            return res.status(500).send({
              message:
                err.message || "Some error occurred while updating the Ppdb.",
            });
          } else {
            res.send(data);
          }
        });
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
  console.log(uid);

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
exports.detailPpdbSetting = (req, res, next) => {
  const id = req.body.id;

  Ppdb.detailPpdbSetting(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailPpdbStudentExcel = (req, res, next) => {
  const id = req.body.id;

  Ppdb.detailPpdbStudentExcel(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailPpdbStudentDetail = (req, res, next) => {
  const id = req.body.id;

  Ppdb.detailPpdbStudentDetail(id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.detailPpdbStudentDetailAdmin = (req, res, next) => {
  const cs_id = req.body.cs_id;

  Ppdb.detailPpdbStudentDetailAdmin(cs_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
exports.PpdbStudentDetailAdminAll = (req, res, next) => {
  const school_id = req.query.school_id;

  Ppdb.PpdbStudentDetailAdminAll(school_id, (err, data) => {
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
