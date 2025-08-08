const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Account Management Functions
**************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
    user: res.locals.accountData,
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  try {
    console.log("Login attempt for email:", account_email)
    const accountData = await accountModel.getAccountByEmail(account_email)
    console.log("Account data retrieved:", accountData ? "Found" : "Not Found")
    
    if (!accountData) {
      console.log("No account found for email:", account_email)
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }

    console.log("Comparing passwords...")
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    console.log("Password match result:", passwordMatch)
    
    if (passwordMatch) {
      delete accountData.account_password
      console.log("Creating JWT token...")
      if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is not defined in environment variables")
        throw new Error("Server configuration error")
      }
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      console.log("JWT token created")
      
      console.log("Setting cookie and redirecting...")
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
      res.locals.accountData = accountData
      req.flash("success", "Logged in successfully")
      return res.redirect("/account/")
    }
    
    console.log("Password did not match")
    req.flash("notice", "Please check your password and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } catch (error) {
    console.error("Login error details:", error)
    req.flash("notice", "An error occurred during login. Please try again.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

async function buildUpdateView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    user: res.locals.accountData,
  })
}

async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  
  if (result) {
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Failed to update account.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      user: res.locals.accountData,
    })
  }
}

async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  let hashedPassword = await bcrypt.hashSync(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)
  
  if (result) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Failed to update password.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      user: res.locals.accountData,
    })
  }
}

async function buildSubmitTicketView(req, res) {
  let nav = await utilities.getNav()
  res.render("account/submit-ticket", {
    title: "Submit Support Ticket",
    nav,
    errors: null,
    user: res.locals.accountData,
  })
}

async function submitTicket(req, res) {
  let nav = await utilities.getNav()
  
  try {
    console.log("Submit ticket request body:", req.body);
    console.log("User data:", res.locals.accountData);

    const { ticket_subject, ticket_description } = req.body
    const account_id = res.locals.accountData.account_id

    if (!account_id) {
      console.error('No account_id found in user data');
      req.flash("notice", "Please log in to submit a ticket.")
      return res.redirect("/account/login")
    }

    if (!ticket_subject || !ticket_description) {
      console.error('Missing required fields:', { ticket_subject, ticket_description });
      req.flash("notice", "Please fill in all required fields.")
      return res.status(400).render("account/submit-ticket", {
        title: "Submit Support Ticket",
        nav,
        errors: null,
        user: res.locals.accountData,
      })
    }

    console.log("Attempting to create ticket with:", {
      account_id,
      ticket_subject,
      ticket_description
    });
    
    const result = await accountModel.createTicket(account_id, ticket_subject, ticket_description)
    console.log("Create ticket result:", result);
    
    if (typeof result === 'string') {
      console.error('Database error creating ticket:', result)
      req.flash("notice", "Database error: " + result)
      return res.status(500).render("account/submit-ticket", {
        title: "Submit Support Ticket",
        nav,
        errors: null,
        user: res.locals.accountData,
      })
    }
    
    if (!result || !result.ticket_id) {
      console.error('No ticket created, result:', result)
      req.flash("notice", "Failed to create ticket. Please try again.")
      return res.status(500).render("account/submit-ticket", {
        title: "Submit Support Ticket",
        nav,
        errors: null,
        user: res.locals.accountData,
      })
    }
    
    console.log("Ticket created successfully:", result);
    req.flash("notice", "Ticket submitted successfully.")
    res.redirect("/account/myTickets")
  } catch (error) {
    console.error('Exception in submitTicket:', error)
    req.flash("notice", "An error occurred: " + error.message)
    res.status(500).render("account/submit-ticket", {
      title: "Submit Support Ticket",
      nav,
      errors: null,
      user: res.locals.accountData,
    })
  }
}

async function buildUserTicketsView(req, res) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const result = await accountModel.getTicketsByAccountId(account_id)
  
  // Handle case where result might be an error message
  const tickets = Array.isArray(result) ? result : []
  
  if (!Array.isArray(result)) {
    console.error('Error fetching tickets:', result)
    req.flash("notice", "Error loading tickets. Please try again.")
  }
  
  res.render("account/my-tickets", {
    title: "My Support Tickets",
    nav,
    errors: null,
    user: res.locals.accountData,
    tickets,
  })
}

module.exports = { 
  buildLogin, 
  buildRegistration, 
  registerAccount, 
  loginAccount,
  buildAccountManagement,
  buildUpdateView,
  updateAccount,
  changePassword,
  buildSubmitTicketView,
  submitTicket,
  buildUserTicketsView
}
