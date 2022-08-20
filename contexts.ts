import { User } from "firebase/auth";
import { Context, createContext } from "react";

export const UserContext: Context<any> = createContext({
  user: null,
  profile: null
});