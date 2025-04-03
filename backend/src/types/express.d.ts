import { IUser } from "../../models/user.model"; // or wherever your user interface/type is

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // or `any` if you're not using a User interface
    }
  }
}
