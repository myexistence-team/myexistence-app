import { Timestamp } from "firebase/firestore"

export type BaseType = {
  id: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string,
  updatedBy: string,
}

export type Profile = BaseType & {
  displayName: string,
  email: string,
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT',
}

export type Teacher = BaseType & Profile & {
  idNumber: string
}

export type School = BaseType & {
  name: string,
  location: string,
  type: 'ELEMENTARY_SCHOOL' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'COLLEGE' | 'TUTOR'
}

export type LoginUser = {
  email: string,
  password: string,
}

export type Schedule = BaseType & {
  title: string,
  location: string,
  startTime: Date,
  endTime: Date,
  tolerance: number
}