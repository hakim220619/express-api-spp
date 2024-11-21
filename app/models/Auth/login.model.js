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
    // Cek apakah req.emailOrnisn ada atau tidak
    if (!req.emailOrnisn || !req.password) {
      return res({
        statusCode: 400,
        message: "Email atau NISN dan password harus diisi!",
      });
    }

    let query;
    let queryValue;

    // Cek apakah req.emailOrnisn berisi email atau NISN
    const isEmail = req.emailOrnisn.includes("@");
// console.log(isEmail);

    if (isEmail) {
      query = `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name, a.logo, a.copy_right, s.school_name 
               FROM users u, role r, aplikasi a, school s 
               WHERE u.role=r.id AND u.school_id=a.school_id and u.school_id=s.id and u.email = ?`;
      queryValue = req.emailOrnisn;
    } else {
      query = `SELECT u.id, u.full_name, u.password, u.image, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name, a.logo, a.copy_right, s.school_name 
               FROM users u, role r, aplikasi a, school s 
               WHERE u.role=r.id AND u.school_id=a.school_id and u.school_id=s.id and u.nisn = ?`;
      queryValue = req.emailOrnisn;
    }

    db.query(query, [queryValue], async (err, respons) => {
      if (err) {
        return res({
          statusCode: 500,
          message: "Internal Server Error.",
        });
      }
// console.log(respons);

      if (respons.length == 0) {
        return res({
          statusCode: 404,
          message: "Email atau NISN tidak terdaftar!",
        });
      } else {
        const verifyPassword = await bcrypt.compare(
          req.password,
          respons[0].password
        );
        if (!verifyPassword) {
          return res({
            statusCode: 401,
            message: "Invalid Password!",
          });
        } else {
          const access_token = generateToken({ data: respons[0].id });

          const queryAccessToken = `INSERT INTO personal_access_tokens 
            (tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
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

          db.query(queryAccessToken, data, (err, result) => {
            if (err) {
              console.log("error: ", err);
              return res({
                statusCode: 500,
                message: "Error storing token.",
              });
            }
          });

          const logData = {
            school_id: respons[0].school_id,
            user_id: respons[0].id,
            activity: "loginAction",
            detail: `Login Berhasil dengan ID ${respons[0].id} dan Nama ${respons[0].full_name}`,
            action: "Insert",
            status: true,
          };

          // Insert log into mm_logs
         await insertMmLogs(logData);

          return res(null,{
            statusCode: 200,
            accessToken: access_token,
            userData: respons[0],
          });
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res({
      statusCode: 500,
      message: "Internal Server Error.",
    });
  }
};

Login.loginSiswaBaruAction = async (req, res) => {
  try {
    db.query(
      `SELECT u.username, u.id, u.full_name, u.password, u.role, u.school_id, r.role_name, a.owner, a.title, a.aplikasi_name,a.logo, a.copy_right, s.school_name FROM calon_siswa u, role r, aplikasi a, school s WHERE u.role=r.id AND u.school_id=a.school_id and u.school_id=s.id and u.username = '${req.username}'`,
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
                res(err, null);
                return;
              }
            });
            // const logData = {
            //   school_id: respons[0].school_id,
            //   user_id: respons[0].id,
            //   activity: "loginAction",
            //   detail: `Login Berhasil dengan ID ${respons[0].id} dan Nama ${respons[0].username}`,
            //   action: "Insert",
            //   status: true
            // };

            // // Insert log into mm_logs
            // insertMmLogs(logData);
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
        console.log(respons);
        
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
Login.logout = async (req, res) => {
  try {
    const token = req.replace("Bearer ", "");
    db.query(
      `DELETE FROM personal_access_tokens WHERE token = '${token}'`,
      (err, result) => {
        if (err) {
          res.status(500).json({
            status: 500,
            message: "An error occurred while logging out.",
          });
          return;
        }

        if (result.affectedRows === 0) {
          res(404, {
            status: 404,
            message: "Token not found or already deleted.",
          });
        } else {
          res(200, {
            status: 200,
            message: "Logout successful. Token deleted.",
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
    res(500, {
      status: 500,
      message: "An unexpected error occurred.",
    });
  }
};


module.exports = Login;
