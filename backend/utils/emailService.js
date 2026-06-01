const nodemailer = require('nodemailer');

// Initialize the SMTP transport manager using your active keys
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Dispatches an automated internal agent notification alert for incoming customer leads
 */
const sendLeadNotification = async (leadData) => {
  try {
    const mailOptions = {
      from: `"Abuja Realty Engine" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER, // Sends instantly to your specified receiver mailbox
      subject: `🚨 NEW PROPERTY LEAD: ${leadData.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 5px; font-weight: 800; tracking-tight: -0.025em;">New Client Lead Captured</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 0;">An inspection or information request has been executed natively.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4b5563; width: 130px;">Client Name:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${leadData.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Email Address:</td>
              <td style="padding: 6px 0; color: #2563eb;">${leadData.email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Phone Contact:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${leadData.phone}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
            <span style="font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Message Notes:</span>
            <p style="color: #374151; font-size: 14px; margin: 5px 0 0 0; line-height: 1.5; font-style: italic;">"${leadData.message}"</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <div style="text-align: center;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #2563eb; color: white; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              Open Agent Command Center →
            </a>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Automated notification dispatched successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ EMAIL NOTIFICATION HOOK FAILURE:', error.message);
    return false;
  }
};

module.exports = { sendLeadNotification };