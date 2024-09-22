const db = require("../../config/db.config");
const { generateToken, verifyToken } = require("../../config/tokenHandler");
const bcrypt = require("bcrypt");
const createHash = require("crypto");
// constructor
const Login = function (data) {
  this.email = data.email;
  this.password = data.password;
};

Login.loginAction = async (req, res) => {
  try {
    db.query(
      `SELECT u.*, r.role_name FROM users u, role r WHERE u.role=r.id and u.email = '${req.email}'`,
      async (err, respons) => {
        console.log(err);
        console.log(respons);
        
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
Login.cheklogin = async (req, res) => {
  try {
    const token = req.replace("Bearer ", "");
    db.query(
      `SELECT u.id, u.uid, u.full_name, u.email, u.date_of_birth, u.address, u.phone, u.status, u.role FROM personal_access_tokens pat, users u, role r WHERE pat.tokenable_id=u.id and u.role=r.id and pat.token = '${token}'`,
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
