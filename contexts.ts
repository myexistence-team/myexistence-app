import { User } from "firebase/auth";
import { Context, createContext } from "react";
import { Class, Profile, School } from "./types";

export const SchoolContext: Context<{
  school: School,
  setSchool: Function
}> = createContext({
  school: {},
  setSchool: () => {}
})

export const AuthContext: Context<{
  auth: User,
  setAuth: Function
}> = createContext({
  auth: {},
  setAuth: () => {}
})

export const ProfileContext: Context<{
  profile: Profile,
  setProfile: Function
}> = createContext({
  profile: {},
  setProfile: () => {}
})

export const ClassesContext: Context<{
  classes: Class[],
  setClasses: Function,
}> = createContext({
  classes: [],
  setClasses: Function
})