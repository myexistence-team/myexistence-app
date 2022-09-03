import { DocumentReference, Timestamp } from "firebase/firestore"

export type BaseType = {
  id: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string,
  updatedBy: string,
}

export type Profile = BaseType & {
  displayName: string,
  schoolId?: string,
  email: string,
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT',
  photoUrl?: string,
  classIds: string[],
  description?: string,
  classes: DocumentReference[],
  currentScheduleId?: string
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
  className: string,
  classDescription: string,
  start: Date,
  end: Date,
  tolerance: number,
  classId: string
}

export type Class = BaseType & {
  className: string,
  classDescription: string,
  // teacherIds: string[],
  // studentsIds: string[],
  // schedules: DocumentReference[]
  
}

export type QRCode =  {
  scanned: boolean
}