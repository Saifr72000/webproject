import rateLimit from "express-rate-limit";

//Rate limiter function for testing.
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100000,
  message: { message: "Too many requests, please try again later" },
  headers: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// If we dont have global rate limiting, then we need to define multiple
// rate limiters to pass on to each route.
