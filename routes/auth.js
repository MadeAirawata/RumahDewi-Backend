const express = require("express");
const { middleware, isAdmin } = require("../middleware/middleware");
const { login, register, whoami } = require("../controllers/auth.controller");
const router = express.Router();

/* GET users listing. */
router.get("/whoami", middleware, whoami);
router.post("/login", login);
router.post("/register", register);

module.exports = router;
