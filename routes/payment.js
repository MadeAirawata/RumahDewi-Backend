const express = require("express");
const { middleware, isAdmin, isUser } = require("../middleware/middleware");
const { rentRoom, addPayment, getPayments, getMyPayments, uploadPayment, changeStatusPayment } = require("../controllers/payment.controller");
const router = express.Router();

/* GET users listing. */
router.post("/", middleware, isUser, addPayment);
router.post("/rent", middleware, isUser, rentRoom);
router.put("/:id/upload", middleware, isUser, uploadPayment);
router.put("/:id/status", middleware, isAdmin, changeStatusPayment);
router.get("/", middleware, isAdmin, getPayments);
router.get("/my", middleware, isUser, getMyPayments);

module.exports = router;
