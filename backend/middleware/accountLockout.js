const { error } = require('../utils/apiResponse');
const User = require('../models/User');

const checkAccountLockout = async (req, res, next) => {
  const email = req.body?.email;
  if (!email) return next();
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user?.lockoutUntil && user.lockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return error(res, `Account temporarily locked. Try again in ${minutesLeft} minutes.`, 423);
    }
    
    next();
  } catch (err) {
    next(); // Don't block login if DB check fails
  }
};

module.exports = { checkAccountLockout };
