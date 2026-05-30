const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure this matches your actual User model file name

// 1. Verify that the user is logged in via a valid JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization Header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Split the "Bearer" string away from the raw token hash code
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify the token signature using your JWT_SECRET key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the matching user account from MongoDB, leaving out the password hash for safety
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user account missing" });
      }

      return next(); // Sequentially hand over execution control to the next route method execution link
    } catch (error) {
      console.error("❌ JWT VERIFICATION BREAKDOWN:", error.message);
      return res.status(401).json({ message: "Not authorized, digital session token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no security token provided" });
  }
};

// 2. Restrict route access to specific organizational user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's account role profile matches the accepted parameters
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role forbidden: Account tier [${req.user?.role || 'Guest'}] is not permitted to read this node resource.` 
      });
    }
    return next();
  };
};

module.exports = { protect, authorize };