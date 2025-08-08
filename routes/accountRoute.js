// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const { registationRules, checkRegData, loginRules, checkLoginData } = require('../utilities/account-validation');

// Public routes (no login required)
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegistration));
router.post("/register", registationRules(), checkRegData, utilities.handleErrors(accountController.registerAccount));
router.post("/login", loginRules(), checkLoginData, utilities.handleErrors(accountController.loginAccount));

// Protected routes (login required)
router.get("/", utilities.checkJWTToken, utilities.handleErrors(accountController.buildAccountManagement));
router.get("/update", utilities.checkJWTToken, utilities.handleErrors(accountController.buildUpdateView));
router.post("/update", utilities.checkJWTToken, utilities.handleErrors(accountController.updateAccount));
router.post("/change-password", utilities.checkJWTToken, utilities.handleErrors(accountController.changePassword));

// Tickets routes (login required)
router.get("/tickets", utilities.checkJWTToken, utilities.handleErrors(accountController.buildSubmitTicketView));
router.post("/tickets", utilities.checkJWTToken, utilities.handleErrors(accountController.submitTicket));
router.get("/myTickets", utilities.checkJWTToken, utilities.handleErrors(accountController.buildUserTicketsView));

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.locals.loggedin = 0;
  res.locals.accountData = null;
  req.flash("success", "You have been logged out successfully");
  res.redirect("/");
});

module.exports = router;