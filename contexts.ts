import { User } from "firebase/auth";
import { Context, createContext } from "react";

export const SchoolContext: Context<any> = createContext(null)
export const AuthContext: Context<any> = createContext(null)
export const ProfileContext: Context<any> = createContext(null)