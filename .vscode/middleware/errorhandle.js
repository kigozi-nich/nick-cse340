// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error("❌ ERROR CAUGHT:", err.stack); // Logs full stack in console

  res.status(err.status || 500).render("error", {
    title: "Server Error",
    message: err.message || "Something went wrong on the server.",
    error: err
  });
}

module.exports = errorHandler;
