const express = require("express");
const router = express.Router();
const { registerUser, authUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/auth", authUser);
module.exports = router;
