module.exports = (app) => {
  // const tutorials = require("../controllers/tutorial.controller.js");
  const Admin = require("../controllers/admin/admin.js");
  const Siswa = require("../controllers/siswa/siswa.js");
  const Register = require("../controllers/Auth/register.js");
  const Login = require("../controllers/Auth/login.js");
  const Kelas = require("../controllers/kelas/kelas.js");
  const Jurusan = require("../controllers/jurusan/jurusan.js");
  const Bulan = require("../controllers/bulan/bulan.js");
  const Sekolah = require("../controllers/sekolah/sekolah.js");
  const Aplikasi = require("../controllers/aplikasi/aplikasi.js");
  const Dashboard = require("../controllers/dashboard/dashboard.js");
  const Pembayaran = require("../controllers/pembayaran/pembayaran.js");
  const SettingPembayaran = require("../controllers/setting/pembayaran/pembayaran.js");
  const general = require("../controllers/general/general.js");
  const token = require("../../app/config/tokenHandler.js");
  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/login", Login.login);
  router.post("/register", Register.register);
  router.get("/cheklogin", token.authenticateToken, Login.cheklogin);
  router.post("/refresh-token", token.authenticateToken, Login.refreshToken);
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
  router.post("/detailSiswa", token.authenticateToken, Siswa.detailSiswa);
  //kelas
  router.get("/list-kelas", token.authenticateToken, Kelas.listKelas);
  router.post("/create-kelas", token.authenticateToken, Kelas.createKelas);
  router.post("/update-kelas", token.authenticateToken, Kelas.updateKelas);
  router.post("/delete-kelas", token.authenticateToken, Kelas.delete);
  router.post("/detailKelas", token.authenticateToken, Kelas.detailKelas);
  //Jurusan
  router.get("/list-jurusan", token.authenticateToken, Jurusan.listJurusan);
  router.post(
    "/create-jurusan",
    token.authenticateToken,
    Jurusan.createJurusan
  );
  router.post(
    "/update-jurusan",
    token.authenticateToken,
    Jurusan.updateJurusan
  );
  router.post("/delete-jurusan", token.authenticateToken, Jurusan.delete);
  router.post("/detailJurusan", token.authenticateToken, Jurusan.detailJurusan);
  //Bulan
  router.get("/list-bulan", token.authenticateToken, Bulan.listBulan);
  router.post("/update-bulan", token.authenticateToken, Bulan.updateBulan);
  router.post("/detailBulan", token.authenticateToken, Bulan.detailBulan);
  //Sekolah
  router.get("/list-sekolah", token.authenticateToken, Sekolah.listSekolah);
  router.post("/create-sekolah", token.authenticateToken, Sekolah.createSekolah);
  router.post("/update-sekolah", token.authenticateToken, Sekolah.updateSekolah);
  router.post("/detailSekolah", token.authenticateToken, Sekolah.detailSekolah);
  router.post("/delete-sekolah", token.authenticateToken, Sekolah.delete);
  //Aplikasi
  router.get("/list-aplikasi", token.authenticateToken, Aplikasi.listAplikasi);
  // router.post("/create-sekolah", token.authenticateToken, Sekolah.createSekolah);
  router.post("/update-aplikasi", token.authenticateToken, Aplikasi.updateAplikasi);
  router.post("/detailAplikasi", token.authenticateToken, Aplikasi.detailAplikasi);
  router.post("/detailSettingAplikasi", token.authenticateToken, Aplikasi.detailSettingAplikasi);
  // router.post("/delete-sekolah", token.authenticateToken, Sekolah.delete);
  //Dashboard List Payment
  router.get("/dashboard-list-payment-month", token.authenticateToken, Dashboard.listPaymentByMonths);
  //Pembayaran
  router.get("/list-payment-pay-byMonth", token.authenticateToken, Pembayaran.listPembayaranPayByMonth);
  router.get("/list-payment-pay-byFree", token.authenticateToken, Pembayaran.listPembayaranPayByFree);
  router.get("/list-payment-pay-byFreeDetail", token.authenticateToken, Pembayaran.listPembayaranPayByFreeDetail);
  router.post("/create-payment-success", token.authenticateToken, Pembayaran.createPaymentSuccess);
  router.post("/create-payment-success-Free", token.authenticateToken, Pembayaran.createPaymentSuccessFree);
  router.post("/create-payment-pending", token.authenticateToken, Pembayaran.createPaymentPending);
  router.post("/create-payment-pending-Free", token.authenticateToken, Pembayaran.createPaymentPendingFree);


  //Setting Pembayaran
  router.get("/list-setting-pembayaran", token.authenticateToken, SettingPembayaran.listSettingPembayaran);
  router.get("/list-setting-pembayaran-detail", token.authenticateToken, SettingPembayaran.listSettingPembayaranDetail);
  router.post("/create-setting-pembayaran", token.authenticateToken, SettingPembayaran.createSettingPembayaran);
  router.post("/create-payment-byFree", token.authenticateToken, SettingPembayaran.createPaymentByFree);
  router.post("/create-payment-byFreeStudent", token.authenticateToken, SettingPembayaran.createPaymentByFreeStudent);
  router.post("/create-payment-byMonth", token.authenticateToken, SettingPembayaran.createPaymentByMonth);
  router.post("/create-payment-byStudent", token.authenticateToken, SettingPembayaran.createPaymentByStudent);
  router.post("/update-payment-updateSettingPaymentByMonth", token.authenticateToken, SettingPembayaran.updateSettingPaymentByMonth);
  router.post("/update-payment-updateSettingPaymentByFree", token.authenticateToken, SettingPembayaran.updateSettingPaymentByFree);
  router.post("/delete-setting-pembayaran", token.authenticateToken, SettingPembayaran.delete);
  router.post("/delete-setting-pembayaran-detail", token.authenticateToken, SettingPembayaran.deleteDetail);
  router.post("/detailSettingPembayaran", token.authenticateToken, SettingPembayaran.detailSettingPembayaran);
  router.post("/detailSettingPembayaranByUid", token.authenticateToken, SettingPembayaran.detailSettingPembayaranByUid);
  router.post("/detailSettingPembayaranByUidFree", token.authenticateToken, SettingPembayaran.detailSettingPembayaranByUidFree);

  //General
  router.get("/getSchool", token.authenticateToken, general.getSchool);
  router.get("/getRole", token.authenticateToken, general.getRole);
  router.get("/getMajors", token.authenticateToken, general.getMajors);
  router.get("/getClass", token.authenticateToken, general.getClass);
  router.get("/getMonths", token.authenticateToken, general.getMonths);
  router.get("/getTypePayment", token.authenticateToken, general.getTypePayment);
  router.get("/cekTransaksiSuccesMidtransByUserId", general.cekTransaksiSuccesMidtransByUserId);
  router.get("/cekTransaksiSuccesMidtrans", general.cekTransaksiSuccesMidtrans);
  router.get("/cekTransaksiSuccesMidtransFree", general.cekTransaksiSuccesMidtransFree);

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
