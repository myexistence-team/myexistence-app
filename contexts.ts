import { User } from "firebase/auth";
import { Context, createContext } from "react";
import { Class, Profile, School, Teacher } from "./types";

export const SchoolContext: Context<{
  school: School,
  setSchool: Function
}> = createContext({
  school: {},
  setSchool: () => {}
})

export const AuthContext: Context<{
  auth: User,
  setAuth: any
}> = createContext({
  auth: {},
  setAuth: () => {}
})

export const ProfileContext: Context<{
  profile: Profile,
  setProfile: any
}> = createContext({
  profile: null,
  setProfile: () => {}
})

export const ClassesContext: Context<{
  classes: Class[],
  setClasses: (a: any) => void,
}> = createContext({
  classes: [],
  setClasses: () => {}
})

export const UsersContext: Context<{
  users: { [key: string]: any },
  setUsers: (a: any) => void
}> = createContext({
  users: {},
  setUsers: () => {}
})