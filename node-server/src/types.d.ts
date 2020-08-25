declare namespace Express {
  import { User } from "./app/entity/User";
  export interface Request {
    user?: User;
  }
}
