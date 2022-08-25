import { User, UserCredential } from "firebase/auth";
import { Context, createContext } from "react";
import { Profile, School } from "./types";

export const SchoolContext: Context<{
  school: any | School,
  setSchool: any | Function
}> = createContext({
  school: null,
  setSchool: null
})
export const AuthContext: Context<{
  auth: any | UserCredential,
  setAuth: any | Function
}> = createContext({
  auth: null,
  setAuth: null
})
export const ProfileContext: Context<{
  profile: any | Profile,
  setProfile: any | Function
}> = createContext({
  profile: null,
  setProfile: null
})