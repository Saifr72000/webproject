import "express";

declare global {
  namespace Express {
    interface Request {

      user?: IUser; // tells TypeScript that the user property might contain a user object

    }
  }
}
