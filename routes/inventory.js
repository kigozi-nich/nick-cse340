const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const utilities = require('../utilities/');
const invValidate = require('../utilities/inventory-validation');

// ✅ Public Route: Vehicle Detail View
router.get('/detail/:invId', utilities.handleErrors(invController.getVehicleDetail));

// ✅ Public Route: Vehicles by Classification
router.get('/type/:classificationId', utilities.handleErrors(invController.buildByClassificationId));

// ✅ Footer-Based 500 Error Trigger (Task 3)
router.get('/trigger-error', (req, res, next) => {
  throw new Error("Intentional Server Error");
});

// ✅ Admin Routes: Management & Add Views
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.managementView));
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addClassificationView));
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addInventoryView));

// ✅ Admin POST Routes
router.post("/add-classification", 
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.post("/add-inventory", 
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
