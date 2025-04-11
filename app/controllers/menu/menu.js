const Menu = require("../../models/menu/menu.model.js");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listMenu = (req, res, next) => {
  const name = req.query.q;
  const school_id = req.query.school_id;
  const is_active = req.query.is_active;

  Menu.listMenu(name, school_id, is_active, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send({data: data});
  });
};

// Create new Admin
exports.createMenu = [
    upload.none(),
    async (req, res) => {
      // Validate request
      if (!req.body) {
        return res.status(400).send({
          message: "Content cannot be empty!",
        });
      }
  
      const { school_id, user_id, description, transaction_type, amount } = req.body;
  
      try {
        // Get the current year
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const academicYear = `${currentYear}/${nextYear}`; // e.g., "2024/2025"
  
        // Create new kas object
        const kas = {
          school_id: school_id,
          user_id: user_id,
          deskripsi: description,
          type: transaction_type,
          amount: amount,
          flag: 1,
          years: academicYear,
          created_at: new Date(),
        };
  
        // Save kas to the database
        Menu.create(kas, (err, data) => {
          if (err) {
            return res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Menu.",
            });
          } else {
            res.send(data);
          }
        });
      } catch (error) {
        res.status(500).send({ message: "Error creating Menu" });
      }
    },
  ];
  

// Update existing Admin
exports.updateMenu = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
      const kas = {
        id: req.body.data.id,
        user_id: req.body.data.user_id,
        deskripsi: req.body.data.description,
        type: req.body.data.transactionType,
        amount: req.body.data.amount,
        updated_at: new Date(),
      }; 
      Menu.update(kas, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Menu.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Menus" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Menu.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailMenu = (req, res, next) => {
  const uid = req.body.uid;
  Menu.detailMenu(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
