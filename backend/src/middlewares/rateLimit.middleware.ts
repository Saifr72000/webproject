import rateLimit from "express-rate-limit";

// Auth endpoints - stricter limits (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 10 attempts per 15 minutes
  message: {
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// API endpoints - moderate limits
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { message: "Too many API requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// File upload endpoints - very strict limits
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: { message: "Too many upload attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Media serving - higher limits (if you keep the API approach)
export const mediaRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // Very high limit - 10,000 media requests per minute
  message: { message: "Too many media requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Always skip rate limiting for media files
    console.log(`🖼️ Media request: ${req.method} ${req.url} from ${req.ip}`);
    return true; // Always skip for media
  },
});

// Legacy global rate limiter (can be removed)
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    console.log(
      `📊 Processing request: ${req.method} ${req.url} from ${req.ip}`
    );
    return true; // Always skip for now
  },
});

// If we dont have global rate limiting, then we need to define multiple
// rate limiters to pass on to each route.
