const Kas = require("../../models/kas/kas.model.js");
const multer = require("multer");
const upload = multer();

// Retrieve all Admins from the database with conditions
exports.listKas = (req, res, next) => {
  const deskripsi = req.query.q;
  const school_id = req.query.school_id;
  const type = req.query.type;

  Kas.listKas(deskripsi, school_id, type, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send(data);
  });
};

// Create new Admin
exports.createKas = [
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
        Kas.create(kas, (err, data) => {
          if (err) {
            return res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Kas.",
            });
          } else {
            res.send(data);
          }
        });
      } catch (error) {
        res.status(500).send({ message: "Error creating Kas" });
      }
    },
  ];
  

// Update existing Admin
exports.updateKas = [
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
      Kas.update(kas, (err, data) => {
        if (err) {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while updating the Kas.",
          });
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating Kass" });
    }
  },
];

// Delete an Admin
exports.delete = (req, res) => {
  const uid = req.body.data;

  Kas.delete(uid, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the Admin.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.detailKas = (req, res, next) => {
  const uid = req.body.uid;
  Kas.detailKas(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
