// Module
require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const indexRouter = require("../routes/index");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Route
app.use("/api/v1", indexRouter);

// 500 error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    status: false,
    message: err.message,
    data: null,
  });
});

// 404 error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: `are you lost? ${req.method} ${req.url} is not registered!`,
    data: null,
  });
});

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
