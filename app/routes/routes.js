module.exports = (app) => {
  // const tutorials = require("../controllers/tutorial.controller.js");
  const Admin = require("../controllers/admin/admin.js");
  const Siswa = require("../controllers/siswa/siswa.js");
  const Register = require("../controllers/Auth/register.js");
  const Login = require("../controllers/Auth/login.js");
  const Kelas = require("../controllers/kelas/kelas.js");
  const general = require("../controllers/general/general.js");
  const token = require("../../app/config/tokenHandler.js");
  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/login", Login.login);
  router.post("/register", Register.register);
  router.get("/cheklogin", token.authenticateToken, Login.cheklogin);
  //Admin
  router.get("/list-admin", token.authenticateToken, Admin.listAdmin);
  router.post("/create-admin", token.authenticateToken, Admin.createAdmin);
  router.post("/update-admin", token.authenticateToken, Admin.updateAdmin);
  router.post("/delete-admin", token.authenticateToken, Admin.delete);
  router.post("/detailAdmin", token.authenticateToken, Admin.detailAdmin);
  //Siswa
  router.get("/list-siswa", token.authenticateToken, Siswa.listSiswa);
  router.post("/create-siswa", token.authenticateToken, Siswa.createSiswa);
  router.post("/update-siswa", token.authenticateToken, Siswa.updateSiswa);
  router.post("/delete-siswa", token.authenticateToken, Siswa.delete);
    // router.post("/detailSiswa", token.authenticateToken, Siswa.detailSiswa);
  //kelas
  router.get("/list-kelas", token.authenticateToken, Kelas.listKelas);
  // router.post("/create-siswa", token.authenticateToken, Siswa.createSiswa);
  // router.post("/update-siswa", token.authenticateToken, Siswa.updateSiswa);
  // router.post("/delete-siswa", token.authenticateToken, Siswa.delete);


  //General
  router.get("/getSchool", token.authenticateToken, general.getSchool);
  router.get("/getRole", token.authenticateToken, general.getRole);
  router.get("/getMajors", token.authenticateToken, general.getMajors);
  router.get("/getClass", token.authenticateToken, general.getClass);

  //Anggota
  // router.get("/list-anggota", token.authenticateToken, Anggota.listAnggota);
  // router.get("/list-anggota-verification", token.authenticateToken, Anggota.listAnggotaVerification);
  // router.post("/create-anggota", token.authenticateToken, Anggota.createAnggota);
  // router.post("/create-anggota-verification", token.authenticateToken, Anggota.createAnggotaVerification);
  // router.post("/update-anggota", token.authenticateToken, Anggota.updateAnggota);
  // router.post("/update-anggota-accept", token.authenticateToken, Anggota.updateAnggotaAccept);
  // router.post("/update-anggota-rejected", token.authenticateToken, Anggota.updateAnggotaRejected);
  // router.post("/delete-anggota", token.authenticateToken, Anggota.delete);

  // //Identity
  // router.get("/get-identity-types", token.authenticateToken, general.getIdentityTypes);

  // // Retrieve all Tutorials
  // router.get("/users/findAll", token.authenticateToken, profile.findAll);
  // router.get("/general/getRoleAdmin", token.authenticateToken, general.roleAdmin);
  // router.post("/general/getRoleNoDeve", token.authenticateToken, general.getRoleNoDeve);
  // router.post("/general/getCompany", token.authenticateToken, general.getCompany);
  // router.get("/general/getStatus", token.authenticateToken, general.getstatus);
  // router.get("/general/getReligion", token.authenticateToken, general.getReligion);
  // router.get("/general/getWorking", token.authenticateToken, general.getWorking);
  // router.get("/general/getMaritalStatus", token.authenticateToken, general.getMaritalStatus);
  // router.post(
  //   "/general/findUsersByUid",
  //   token.authenticateToken,
  //   general.findUsersByUid
  // );
  router.get("/faker/generate", general.generate);

  app.use("/api", router);
};
