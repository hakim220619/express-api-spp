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
    else res.send({ data: data });
  });
};
exports.listMenuMain = (req, res, next) => {
  const name = req.query.q;

  Menu.listMenuMain(name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send({ data: data });
  });
};
exports.listMenu = (req, res, next) => {
  const name = req.query.q;
  const school_id = req.query.school_id;
  const is_active = req.query.is_active;

  Menu.listMenu(name, school_id, is_active, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send({ data: data });
  });
};
exports.listMenuPermission = (req, res, next) => {
  const name = req.query.q;
  const school_id = req.query.school_id;
  const status = req.query.status;

  Menu.listMenuPermission(name, school_id, status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Data.",
      });
    else res.send({ data: data });
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

    const { parent_id, name, icon, status, address, order_list } = req.body;

    try {

      const menu = {
        parent_id: parent_id || null,
        name: name,
        icon: icon,
        address: address,
        order_list: order_list,
        created_at: new Date(),
        updated_at: new Date()
      };



      // Save Menu to the database
      Menu.create(menu, (err, data) => {
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

// Create new Admin
exports.createMenuPermission = [
  upload.none(),
  async (req, res) => {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    const { school_id, menu_id, role_id, created, read, updated, deleted } = req.body;

    try {

      const menu = {
        school_id: school_id || null,
        menu_id: menu_id,
        role_id: role_id,
        created: created,
        read: read,
        updated: updated,
        deleted: deleted,
        created_at: new Date(),
        updated_at: new Date()
      };



      // Save Menu to the database
      Menu.createMenuPermission(menu, (err, data) => {
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
    const { id, parent_id, name, icon, address, order_list } = req.body.data;

     
      const menu = {
        id: id,
        parent_id: parent_id,
        name: name,
        icon: icon,
        address: address,
        order_list: order_list,
        updated_at: new Date()
      };
      Menu.update(menu, (err, data) => {
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

// Update existing Admin
exports.updateMenuPermission = [
  upload.none(),
  async (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content cannot be empty!",
      });
    }

    try {
    const { id, school_id, menu_id, role_id, created, status, read, updated, deleted } = req.body.data;

     
      const menu = {
        id: id,
        school_id: school_id,
        menu_id: menu_id,
        role_id: role_id,
        created: created,
        status: status,
        read: read,
        updated: updated,
        deleted: deleted,
        updated_at: new Date()
      };
      Menu.updateMenuPermission(menu, (err, data) => {
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
// Delete an Admin
exports.deletePermission = (req, res) => {
  const uid = req.body.data;

  Menu.deletePermission(uid, (err, data) => {
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
exports.detailMenuPermission = (req, res, next) => {
  const uid = req.body.uid;
  Menu.detailMenuPermission(uid, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    else res.send(data);
  });
};
