const db = require("../../config/db.config");
const { generateToken, verifyToken } = require("../../config/tokenHandler");
const bcrypt = require("bcrypt");
const createHash = require("crypto");
const { insertMmLogs } = require("../../helpers/helper");
// constructor
const Login = function (data) {
  this.email = data.email;
  this.password = data.password;
};

Login.loginAction = async (req, res) => {
  try {
    db.query(
      `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name,a.logo, a.copy_right, s.school_name FROM users u, role r, aplikasi a, school s WHERE u.role=r.id AND u.school_id=a.school_id and u.school_id=s.id and u.email = '${req.email}'`,
      async (err, respons) => {   
        if (respons.length == 0) {
          res(err, {
            message: "Email tidak terdaftar!.",
          });
          return;
        } else {
          const verifyPassword = await bcrypt.compare(
            req.password,
            respons[0].password
          );
          if (!verifyPassword) {
            res(err, {
              message: "Invalid Password!.",
            });
            return;
          } else {
            const access_token = generateToken({ data: respons[0].uid });
            // // Storing refresh token in MD5 format
            const queryAccesToke =
              "INSERT INTO `personal_access_tokens` (`tokenable_type`,`tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`) VALUES (?,?,?,?,?,?,?,?)";
            const data = [
              "AppModelsUser",
              respons[0].id,
              "authToken",
              access_token,
              '["*"]',
              null,
              null,
              new Date(),
            ];
            
            db.query(queryAccesToke, data, (err, res) => {
              if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
              }
            });
            const logData = {
              school_id: respons[0].school_id,
              user_id: respons[0].id,
              activity: "loginAction",
              detail: `Login Berhasil dengan ID ${respons[0].id} dan Nama ${respons[0].full_name}`,
              action: "Insert",
              status: true
            };

            // Insert log into mm_logs
            insertMmLogs(logData);
            res(200, {
              status: 200,
              accessToken: access_token,
              userData: respons[0],
            });
            return;
          }
          // Generating Access and Refresh Token
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};
Login.checklogin = async (req, res) => {
  try {
    const token = req.replace("Bearer ", "");
    db.query(
      `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name,a.logo, a.copy_right, s.school_name FROM personal_access_tokens pat, users u, role r, aplikasi a, school s WHERE pat.tokenable_id=u.id and u.role=r.id AND u.school_id=a.school_id AND u.school_id=s.id and pat.token = '${token}'`,
      async (err, respons) => {
        if (respons.length == 0) {
          res(err, {
            message: "Token tidak terdaftar!.",
          });
          return;
        } else {
          // console.log(respons[0]);
          res(200, {
            status: 200,
            accessToken: token,
            message: "Login Active",
            userData: respons[0],
          });
          return;
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = Login;
