import { User } from "firebase/auth";
import { Context, createContext } from "react";
import { Class, Profile, School, Teacher } from "./types";

export const SchoolContext: Context<{
  school: School,
  setSchool: (a?: any) => any
}> = createContext({
  school: {},
  setSchool: () => {}
})

export const AuthContext: Context<{
  auth: User,
  setAuth: (a?: any) => any
}> = createContext({
  auth: {},
  setAuth: () => {}
})

export const ProfileContext: Context<{
  profile: Profile,
  setProfile: (a?: any) => any,
}> = createContext({
  profile: null,
  setProfile: () => {}
})

export const ClassesContext: Context<{
  classes: Class[],
  setClasses: (a?: any) => any,
}> = createContext({
  classes: [],
  setClasses: () => {}
})

export const UsersContext: Context<{
  users: { [key: string]: Profile },
  setUsers: (a?: any) => any
}> = createContext({
  users: {},
  setUsers: () => {}
})

export const LocationContext: Context<{
  location: any,
  setLocation: (a?: any) => any,
  startForegroundLocation: (a?: any) => any,
  stopForegroundLocation: (a?: any) => any,
  startBackgroundLocation: (a?: any) => any,
  stopBackgroundLocation: (a?: any) => any,
  getLocation: () => any
}> = createContext({
  location: null,
  setLocation: () => {},
  startForegroundLocation: () => {},
  stopForegroundLocation: () => {},
  startBackgroundLocation: () => {},
  stopBackgroundLocation: () => {},
  getLocation: () => {}
})