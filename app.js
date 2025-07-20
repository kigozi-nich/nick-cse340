// ===== Imports =====
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const baseController = require('./controllers/baseController');
const utilities = require('./utilities'); // ✅ Your utility functions

// ===== View Engine and Middleware Setup =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== Static Files, Sessions, Flash, etc. =====
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({...}));
app.use(flash());
app.use(express.urlencoded({ extended: true }));

// ✅ ===== DYNAMIC NAV MIDDLEWARE =====
app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav(); // Makes <%- nav %> available
  next();
});

// ===== ROUTES =====
const inventoryRoute = require('./routes/inventory');
app.use('/inv', inventoryRoute);

// ===== ERROR HANDLING =====
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler); // ✅ Global error middleware
