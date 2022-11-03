import { DocumentReference, Timestamp } from "firebase/firestore"
import { ScheduleOpenMethods } from "./constants/constants"

export type BaseType = {
  id: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string,
  updatedBy: string,
}

export type Profile = BaseType & {
  displayName: string,
  schoolId: string,
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
  classId: string,
  openMethod?: ScheduleOpenMethods
}

export type Class = BaseType & {
  className: string,
  classDescription: string,
  name?: string
  // teacherIds: string[],
  // studentsIds: string[],
  // schedules: DocumentReference[]
  
}

export type Log = {
  id: string,
  isCurrent?: boolean,
  schedule: {
    start: Timestamp,
    end: Timestamp,
    openedAt: Timestamp,
    closedAt: Timestamp,
    tolerance: number,
  },
  excuse?: {
    proofUrl: string,
    reason: string,
  },
  studentId: string,
  teacherId: string,
  classId: string,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string,
  time: Timestamp
}

export type QRCode =  {
  scanned: boolean
}

export type LogCounts = {
  absentCount: number,
  excusedCount: number,
  presentCount: number,
  lateCount: number
}

export type LogCountBySchedule = LogCounts & {
  scheduleId: string,
  schedule: any
}

export type LogCountByClass = {
  classId?: string,
  className?: string,
  counts: LogCountBySchedule[];
}