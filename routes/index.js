const express = require("express");
const router = express.Router();
const authRoute = require("./auth");
const roomRoute = require("./room");
const paymentRoute = require("./payment");

/* GET home page. */
router.use("/auth", authRoute);
router.use("/rooms", roomRoute);
router.use("/payments", paymentRoute);

module.exports = router;
