const rateLimit = require('express-rate-limit');
const { error } = require('../utils/apiResponse');

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// BYPASS MIDDLEWARE (for dev/monitoring)
const rateLimitBypass = (req, res, next) => {
  if (isDevelopment) return next();
  if (req.path === '/health' || req.path === '/api/health') return next();
  if (req.headers['x-internal-key'] === process.env.INTERNAL_API_KEY) return next();
  next();
};

// TRUSTED IP CHECKER
const trustedIPs = new Set(process.env.TRUSTED_IPS?.split(',') || []);
const checkTrustedIP = (req, res, next) => {
  req.trustedIP = trustedIPs.has(req.ip);
  next();
};

// GENERAL API LIMITER
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  validate: { default: false },
  handler: (req, res) => {
    error(res, 'Too many requests, please try again later.', 429);
  }
});

// SMART AUTH LIMITER (tiered based on user type)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    if (req.trustedIP) return 1000; // Trusted networks
    if (req.user?.isPremium) return 500; // Premium users
    return 10; // Free tier: 10 attempts per 15 min
  },
  validate: { default: false },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    error(res, 'Too many login attempts. Please try again in 15 minutes.', 429);
  }
});

// EMAIL-SPECIFIC LIMITER (prevent account enumeration)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => `email:${req.body?.email?.toLowerCase() || req.ip}`,
  skipSuccessfulRequests: true,
  validate: { default: false },
  handler: (req, res) => {
    error(res, 'Too many attempts for this email. Try again later.', 429);
  }
});

// DYNAMIC USER LIMITER (by JWT user ID)
const createDynamicUserLimiter = (maxRequestsPerMinute) => {
  return rateLimit({
    windowMs: 60 * 1000,
    max: maxRequestsPerMinute,
    validate: { default: false },
    keyGenerator: (req) => {
      return req.user ? req.user._id.toString() : (req.ip || 'unknown_ip');
    },
    handler: (req, res) => {
      error(res, `Rate limit exceeded. Maximum ${maxRequestsPerMinute} requests per minute allowed.`, 429);
    }
  });
};

const strictUserLimiter = createDynamicUserLimiter(30);
const moderateUserLimiter = createDynamicUserLimiter(60);

module.exports = {
  rateLimitBypass,
  checkTrustedIP,
  apiLimiter,
  authLimiter,
  emailLimiter,
  strictUserLimiter,
  moderateUserLimiter
};
