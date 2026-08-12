import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn({ ip: req.ip, url: req.url }, "Rate limit exceeded");
    res.status(options.statusCode).json(options.message);
  },
  skip: (req: Request) => {
    return req.path === "/healthz";
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too Many Requests",
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn({ ip: req.ip, url: req.url }, "Auth rate limit exceeded");
    res.status(options.statusCode).json(options.message);
  },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: "Too Many Requests",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn({ ip: req.ip, url: req.url }, "Strict rate limit exceeded");
    res.status(options.statusCode).json(options.message);
  },
});

export { generalLimiter, authLimiter, strictLimiter };