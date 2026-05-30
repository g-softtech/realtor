const express = require("express");
const router = express.Router();
const { createLead, getLeads, updateLeadStatus } = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Handles creating a lead and fetching all leads
router.route("/")
  .post(createLead) // 🔓 PUBLIC: Anyone browsing your Abuja properties can book an inspection
  .get(protect, authorize("agent", "admin"), getLeads); // 🔒 SECURED: Only logged-in agents/admins can download the lead list

// Handles updating a specific lead by its ID
router.route("/:id")
  .patch(protect, authorize("agent", "admin"), updateLeadStatus); // 🔒 SECURED: Only internal staff can toggle status states

module.exports = router;