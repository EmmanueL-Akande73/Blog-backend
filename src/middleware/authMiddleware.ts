// Import types from express for request, response, and next function
import { Request, Response, NextFunction } from 'express';
// Import jsonwebtoken for JWT handling
import jwt from 'jsonwebtoken';
// Import dotenv to load environment variables
import dotenv from 'dotenv';

// Extend Express Request type to include user property
// This allows us to attach user info to the request object
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config(); // Load environment variables from .env file

// Middleware to authenticate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  // Extract the token from the header (format: Bearer <token>)
  const token = authHeader?.split(' ')[1];

  // If no token, respond with 401 Unauthorized
  if (!token) {
    res.sendStatus(401);
    return;
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      res.sendStatus(403); // Invalid token
      return;
    }

    if (!decoded) {
      res.sendStatus(401); // No decoded payload
      return;
    }

    // Set user info including role from the JWT token
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      branchId: decoded.branchId // Add branchId from JWT if present
    };
    next(); // Continue to next middleware/handler
  });
};

// Middleware to authorize user by role
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req.user as any).role;
    // If user role is not in allowed roles, deny access
    if (!roles.includes(userRole)) {
      res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
      return;
    }
    next(); // Continue if authorized
  };
};
