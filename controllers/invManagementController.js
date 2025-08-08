const utilities = require("../utilities")
const invModel = require("../models/inventory-model")
const invManagementController = {}

/* ***************************
 * Build inventory management view
 * ************************** */
invManagementController.buildManager = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classifications = await invModel.getClassifications()
    
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classifications: classifications.rows,
      errors: null,
      message: null
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invManagementController
