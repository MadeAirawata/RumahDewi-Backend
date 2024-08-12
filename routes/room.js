const express = require("express");
const { middleware, isAdmin, isUser } = require("../middleware/middleware");
const { getRooms, getUserRoom } = require("../controllers/room.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", getRooms);
router.get("/my", middleware, isUser, getUserRoom);

module.exports = router;
