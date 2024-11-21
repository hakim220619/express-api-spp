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
      const { school_id, unit_id, years, amount, status, address, url, target } =
        req.body;

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
  ]),
  async (req, res) => {
    // Validasi permintaan
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    // Daftar field yang wajib ada
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

    // Cek apakah semua field yang diperlukan ada dan tidak null
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({
          message: `${field} cannot be empty!`,
        });
      }
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

    // Ekstrak jalur file dari multer
    const files = req.files;

    const kartuKeluarga = files.kartuKeluarga
      ? files.kartuKeluarga[0].path
      : req.body.kartuKeluarga;
    const akteLahir = files.akteLahir ? files.akteLahir[0].path : req.body.akteLahir;
    const ktpOrangtua = files.ktpOrangtua ? files.ktpOrangtua[0].path : req.body.ktpOrangtua;
    const ijasah = files.ijasah ? files.ijasah[0].path : req.body.ijasah;

    try {
      // Kompresi gambar jika ada

      // Buat objek data siswa baru
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
        guardian_name: guardianName === "undefined" ? "" : guardianName,
        guardian_nik: guardianNik === "undefined" ? "" : guardianNik,
        guardian_birth_year:
          guardianBirthYear === "undefined" ? "" : guardianBirthYear,
        guardian_education:
          guardianEducation === "undefined" ? "" : guardianEducation,
        guardian_job: guardianJob === "undefined" ? "" : guardianJob,
        guardian_income: guardianIncome
          ? isNaN(parseInt(guardianIncome.replace(/[Rp.]/g, ""), 10))
            ? null
            : parseInt(guardianIncome.replace(/[Rp.]/g, ""), 10)
          : null,
        kartu_keluarga: kartuKeluarga,
        akte_lahir: akteLahir,
        ktp_orangtua: ktpOrangtua,
        ijasah: ijasah,
        created_at: new Date(),
      };

      // Simpan data siswa ke database
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

exports.updatePpdbSetting = [
  upload.single('image'), // Menggunakan upload.single untuk menangani upload file
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
console.log(result);

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
              message: err.message || "Some error occurred while updating the Ppdb.",
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
