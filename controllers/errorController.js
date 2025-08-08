const utilities = require("../utilities")
const errorController = {}

/* ****************************************
*  Deliver 500 error message
* *************************************** */
errorController.error500 = async function(err, req, res, next){
  const nav = await utilities.getNav()
  res.status(500).render("errors/error", {
    title: '500: Server Error',
    message: err.message,
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver 404 error message
* *************************************** */
errorController.error404 = async function(req, res) {
  const nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: '404: Page Not Found',
    message: 'Sorry, the page you requested cannot be found.',
    nav,
    errors: null
  })
}

module.exports = errorController
