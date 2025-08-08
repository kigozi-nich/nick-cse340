const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Middleware For Handling Authorization
 ************************ */
async function checkLogin(req, res, next) {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt
    try {
      const accountData = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.accountData = accountData
      next()
    } catch (error) {
      console.error("Authorization error:", error)
      res.clearCookie("jwt")
      res.redirect("/account/login")
    }
  } else {
    next()
  }
}

/* ************************
 * Check Account Type
 ************************ */
function checkAccountType(req, res, next) {
  if (res.locals.accountData) {
    if (res.locals.accountData.account_type === "Admin" || res.locals.accountData.account_type === "Employee") {
      next()
    } else {
      req.flash("notice", "Please log in with appropriate credentials")
      res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in.")
    res.redirect("/account/login")
  }
}

module.exports = { checkLogin, checkAccountType }