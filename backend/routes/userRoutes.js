const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/userController");

// Maps paths to our controller actions
router.route("/").post(registerUser);
router.post("/login", loginUser);

module.exports = router;