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
  const Affiliate = require("../controllers/affiliate/affiliate.js");
  const Report = require("../controllers/report/report.js");
  const SettingPembayaran = require("../controllers/setting/pembayaran/pembayaran.js");
  const Unit = require("../controllers/unit/unit.js");
  const general = require("../controllers/general/general.js");
  const Permission = require("../controllers/permission/permission.js");
  const Tunggakan = require("../controllers/tunggakan/tunggakan.js"); 
  const Ppdb = require("../controllers/ppdb/ppdb.js"); 
  const TemplateMessage = require("../controllers/templateMessage/templateMessage.js");
  const token = require("../../app/config/tokenHandler.js");
  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/login", Login.login);
  router.post("/loginSiswaBaru", Login.loginSiswaBaru);
  router.post("/register", Register.register);
  router.get("/checklogin", token.authenticateToken, Login.checklogin);
  router.get("/refresh-token", token.authenticateToken, Login.refreshToken);
  //Admin
  router.get("/list-admin", token.authenticateToken, Admin.listAdmin);
  router.post("/create-admin", token.authenticateToken, Admin.createAdmin);
  router.post("/update-admin", token.authenticateToken, Admin.updateAdmin);
  router.post("/delete-admin", token.authenticateToken, Admin.delete);
  router.post("/detailAdmin", token.authenticateToken, Admin.detailAdmin);
  //Affiliate
  router.get("/list-affiliate", token.authenticateToken, Affiliate.listAffiliate);
  router.post("/create-account-affiliate", token.authenticateToken, Affiliate.createAccountAffiliate);
  // router.post("/update-admin", token.authenticateToken, Admin.updateAdmin);
  // router.post("/delete-admin", token.authenticateToken, Admin.delete);
  // router.post("/detailAdmin", token.authenticateToken, Admin.detailAdmin);
  //Siswa
  router.get("/list-siswa", token.authenticateToken, Siswa.listSiswa);
  router.post("/create-siswa", token.authenticateToken, Siswa.createSiswa);
  router.post("/update-siswa", token.authenticateToken, Siswa.updateSiswa);
  router.post("/delete-siswa", token.authenticateToken, Siswa.delete);
  router.post("/detailSiswa", token.authenticateToken, Siswa.detailSiswa);
  router.post("/upload-siswa", token.authenticateToken, Siswa.uploadSiswa);
  router.post("/registerSiswa", Siswa.registerSiswa);
  //Ppdb
  router.get("/list-ppdb", token.authenticateToken, Ppdb.listPpdb);
  router.get("/list-setting-ppdb", token.authenticateToken, Ppdb.listSettingPpdb);
  router.post("/create-setting-ppdb", token.authenticateToken, Ppdb.createSettingPpdb);
  router.post("/update-ppdb-setting", token.authenticateToken, Ppdb.updatePpdbSetting);
  router.post("/update-ppdb", token.authenticateToken, Ppdb.updatePpdb);
  router.post("/delete-ppdb", token.authenticateToken, Ppdb.delete);
  router.post("/delete-setting-ppdb", token.authenticateToken, Ppdb.deleteSettingPpdb);
  router.post("/detailPpdb", token.authenticateToken, Ppdb.detailPpdb);
  router.post("/detailPpdbSetting", token.authenticateToken, Ppdb.detailPpdbSetting);
  router.post("/detailPpdbStudentExcel", token.authenticateToken, Ppdb.detailPpdbStudentExcel);
  router.post("/detailPpdbStudentDetail", token.authenticateToken, Ppdb.detailPpdbStudentDetail);
  router.post("/detailPpdbStudentDetailAdmin", token.authenticateToken, Ppdb.detailPpdbStudentDetailAdmin);
  router.post("/detailSiswaBaru", Ppdb.detailSiswaBaru);
  router.post("/detailCalonSiswaBaru", Ppdb.detailCalonSiswaBaru);
  router.post("/verifikasi-siswa-baru", token.authenticateToken, Ppdb.verifikasiSiswaBaru);
  router.post("/terima-siswa-baru", token.authenticateToken, Ppdb.terimaSiswaBaru);
  router.post("/tolak-siswa-baru", token.authenticateToken, Ppdb.tolakSiswaBaru);
  router.post("/reload-payment-siswa-baru", token.authenticateToken, Ppdb.reloadPaymentSiswaBaru);
  router.post("/sendDataSiswaBaruAll", token.authenticateToken, Ppdb.sendDataSiswaBaruAll);
  router.post("/reviewAndMasukanBySiswa", Ppdb.reviewAndMasukanBySiswa);
  //kelas
  router.get("/list-kelas", token.authenticateToken, Kelas.listKelas);
  router.post("/create-kelas", token.authenticateToken, Kelas.createKelas);
  router.post("/update-kelas", token.authenticateToken, Kelas.updateKelas);
  router.post("/delete-kelas", token.authenticateToken, Kelas.delete);
  router.post("/detailKelas", token.authenticateToken, Kelas.detailKelas);
  //permission
  router.get("/list-permission", token.authenticateToken, Permission.listPermission);
  router.post("/create-permission", token.authenticateToken, Permission.createPermission);
  router.post("/update-permission", token.authenticateToken, Permission.updatePermission);
  router.post("/delete-permission", token.authenticateToken, Permission.delete);
  router.post("/detailPermission", token.authenticateToken, Permission.detailPermission);
  //permission
  router.get("/list-templateMessage", token.authenticateToken, TemplateMessage.listTemplateMessage);
  router.post("/create-templateMessage", token.authenticateToken, TemplateMessage.createTemplateMessage);
  router.post("/update-templateMessage", token.authenticateToken, TemplateMessage.updateTemplateMessage);
  router.post("/delete-templateMessage", token.authenticateToken, TemplateMessage.delete);
  router.post("/detailTemplateMessage", token.authenticateToken, TemplateMessage.detailTemplateMessage);
  
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
  router.get("/dashboard-list-payment-month-byAdmin", token.authenticateToken, Dashboard.listPaymentByMonthsByAdmin);
  router.get("/get-total-pembayaran-bulanan", token.authenticateToken, Dashboard.getTotalPembayaranBulanan);
  router.get("/get-total-pembayaran-bebas", token.authenticateToken, Dashboard.getTotalPembayaranBebas);
  router.get("/get-total-tunggakan-bulanan", token.authenticateToken, Dashboard.getTotalTunggakanBulanan);
  router.get("/get-total-tunggakan-bebas", token.authenticateToken, Dashboard.getTotalTunggakanBebas);
  router.get("/get-saldo-bySchool", token.authenticateToken, Dashboard.getSaldoBySchool);
  router.get("/get-transaski-affiliate-bySchool", token.authenticateToken, Dashboard.getTransaksiAffiliateBySchool);
  router.get("/get-total-tunggakan-bulanan-bySiswa", token.authenticateToken, Dashboard.getTotalTunggakanBulananBySiswa);
  router.get("/get-total-tunggakan-free-bySiswa", token.authenticateToken, Dashboard.getTotalTunggakanFreeBySiswa);
  router.get("/get-total-payment-this-day", token.authenticateToken, Dashboard.getTotalPaymentThisDay);
  router.get("/get-total-payment-this-week", token.authenticateToken, Dashboard.getTotalPaymentThisWeek);
  router.get("/get-total-payment-this-month", token.authenticateToken, Dashboard.getTotalPaymentThisMonth);
  router.get("/get-total-payment-this-years", token.authenticateToken, Dashboard.getTotalPaymentThisYears);
  router.get("/get-total-login-mmLogs", token.authenticateToken, Dashboard.getTotalLoginMmLogs);
  router.get("/getCountMonthAndFree", token.authenticateToken, Dashboard.getCountMonthAndFree);
  //Pembayaran
  router.get("/list-payment-pay-byMonth", token.authenticateToken, Pembayaran.listPembayaranPayByMonth);
  router.get("/list-payment-pay-byFree", token.authenticateToken, Pembayaran.listPembayaranPayByFree);
  router.get("/list-payment-pay-byFreeDetail", token.authenticateToken, Pembayaran.listPembayaranPayByFreeDetail);
  router.post("/create-payment-success", token.authenticateToken, Pembayaran.createPaymentSuccess);
  router.post("/create-payment-success-Free", token.authenticateToken, Pembayaran.createPaymentSuccessFree);
  router.post("/create-payment-pending", token.authenticateToken, Pembayaran.createPaymentPending);
  router.post("/create-payment-pending-byAdmin", token.authenticateToken, Pembayaran.createPaymentPendingByAdmin);
  router.post("/create-payment-pending-byAdmin-free", token.authenticateToken, Pembayaran.createPaymentPendingByAdminFree);
  router.post("/create-payment-pending-Free", token.authenticateToken, Pembayaran.createPaymentPendingFree);
  //Sekolah
  router.get("/list-unit", token.authenticateToken, Unit.listUnit);
  router.post("/create-unit", token.authenticateToken, Unit.createUnit);
  router.post("/update-unit", token.authenticateToken, Unit.updateUnit);
  router.post("/detailUnit", token.authenticateToken, Unit.detailUnit);
  router.post("/delete-unit", token.authenticateToken, Unit.delete);
  //Report
  router.get("/list-report", token.authenticateToken, Report.listReport);
  router.get("/list-report-free", token.authenticateToken, Report.listReportFree);
  //Tunggakan
  router.get("/list-tunggakan", token.authenticateToken, Tunggakan.listTunggakan);
  router.post("/sendTunggakanSiswa", token.authenticateToken, Tunggakan.sendTunggakanSiswa);
  // router.get("/list-report-free", token.authenticateToken, Report.listReportFree);

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
  router.get("/getUsersAffiliate", token.authenticateToken, general.getUsersAffiliate);
  router.get("/getRole", token.authenticateToken, general.getRole);
  router.get("/getMajors", token.authenticateToken, general.getMajors);
  router.get("/getClass", token.authenticateToken, general.getClass);
  router.get("/getMonths", token.authenticateToken, general.getMonths);
  router.get("/getTypePayment", token.authenticateToken, general.getTypePayment);
  router.get("/getUnit", token.authenticateToken, general.getUnit);
  router.get("/getYears", token.authenticateToken, general.getYears);
  router.get("/getListPayment", token.authenticateToken, general.getListPayment);
  router.get("/getActivityBySchoolId", token.authenticateToken, general.getActivityBySchoolId);
  router.post("/sendMessageBroadcast", token.authenticateToken, general.sendMessageBroadcast);
  router.get("/getDetailClassMajorUsers", token.authenticateToken, general.getDetailClassMajorUsers);
  router.get("/cekTransaksiSuccesMidtransByUserIdFree", general.cekTransaksiSuccesMidtransByUserIdFree);
  router.get("/cekTransaksiSuccesMidtransByUserIdByMonth", general.cekTransaksiSuccesMidtransByUserIdByMonth);
  router.get("/cekTransaksiPaymentSiswaBaru", general.cekTransaksiPaymentSiswaBaru);
  router.get("/cekTransaksiSuccesMidtrans", general.cekTransaksiSuccesMidtrans);
  router.get("/cekTransaksiSuccesMidtransFree", general.cekTransaksiSuccesMidtransFree);
  router.get("/rolePermissions", general.rolePermissions);
  router.get("/getMenuActive", token.authenticateToken, general.getMenuActive);
  router.get("/getPdfByIdPaymentMonth", token.authenticateToken, general.getPdfByIdPaymentMonth);
  router.get("/getDataMaster", token.authenticateToken, general.getDataMaster);
  router.get("/getUnits", general.getUnit);
  router.get("/getListPpdbActive", general.getListPpdbActive);
  router.post("/forgot-password", general.forgetPassword);
  router.post("/reset-new-password", general.resetNewPassword);
  router.post("/new-password-all",  token.authenticateToken, general.newPasswordAll);
  router.post("/send-message",  token.authenticateToken, general.sendMessages);

  router.get("/cekFunction", general.cekFunction);
  router.get("/faker/generate", general.generate);

  app.use("/api", router);
};
