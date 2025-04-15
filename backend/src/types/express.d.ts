import { IUser } from "../../models/user.model"; // or wherever your user interface/type is

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // tells TypeScript that the user property might contain a user object
    }
  }
}
