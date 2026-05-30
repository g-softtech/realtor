const Lead = require("../models/Lead");
const nodemailer = require("nodemailer");

// Configure the mailing transport mechanism
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, 
  tls: {
    rejectUnauthorized: false
  }
});

// @desc    Submit a new inquiry / lead + Send Email Notification
// @route   POST /api/leads
// @access  Public
const createLead = async (req, res) => {
  try {
    // 1. Accept either casing from the frontend safely
    const { name, email, phone, message, propertyId, property_id } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // 2. Map directly to your schema's exact property_id key
    const newLead = await Lead.create({
      name,
      email,
      phone,
      message,
      property_id: property_id || propertyId || null,
      status: 'new' // Matches your lowercase default enum
    });

    // 3. Email Template Dispatches
    const mailOptions = {
      from: `"Abuja Realty Alerts" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `🚨 NEW INSPECTION REQUEST: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-bottom: 4px;">Abuja Realty Platform</h2>
          <p style="color: #666; font-size: 14px; margin-top: 0;">New Lead Generated</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 130px;">Client Name:</td>
              <td style="padding: 6px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Phone Number:</td>
              <td style="padding: 6px 0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Email Address:</td>
              <td style="padding: 6px 0;">${email}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 5px; color: #111;">Client Message:</strong>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #444;">${message}</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Notification email dispatched successfully! 📧", info.messageId);

    return res.status(201).json({ 
      message: "Inquiry submitted successfully! 🚀 Team notified.", 
      lead: newLead 
    });

  } catch (error) {
    console.error("❌ CRITICAL DISPATCH ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leads (Newest first)
// @route   GET /api/leads
// @access  Public (Temporary for testing)
const getLeads = async (req, res) => {
  try {
    // Populates data based on your exact schema layout reference
    const leads = await Lead.find().populate('property_id').sort({ createdAt: -1 });
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id
// @access  Public (Temporary for testing)
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting lowercase: 'new', 'contacted', 'converted', 'closed'
    
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.status(200).json({ message: "Status updated successfully", lead: updatedLead });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createLead, getLeads, updateLeadStatus };