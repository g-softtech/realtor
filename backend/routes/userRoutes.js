const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getUsers, deleteUser, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Maps paths to our controller actions
router.route("/").post(registerUser).get(protect, authorize('admin'), getUsers);
router.post("/login", loginUser);

// Admin user management routes
router.route("/:id").delete(protect, authorize('admin'), deleteUser);
router.route("/:id/role").put(protect, authorize('admin'), updateUserRole);

module.exports = router;