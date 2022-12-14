import { DocumentReference, GeoPoint, Timestamp } from "firebase/firestore"
import { AbsentStasuses, ExcuseStatuses, ScheduleOpenMethods, ScheduleStasuses } from "./constants/constants"

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
  hasRegistered: boolean,
  isVerified: boolean,
  classes: DocumentReference[],
  currentScheduleId?: string,
  idNumber?: string
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
  className?: string,
  classDescription?: string,
  start: Timestamp,
  end: Timestamp,
  tolerance: number,
  classId: string,
  status: ScheduleStasuses,
  openMethod?: ScheduleOpenMethods,
  location?: GeoPoint,
  openedAt?: Timestamp,
  closedAt?: Timestamp,
}

export type Class = BaseType & {
  className: string,
  classDescription: string,
  name?: string,
  description?: string,
  // teacherIds: string[],
  studentIds: string[],
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
    message: string,
  },
  excuseStatus?: ExcuseStatuses,
  studentId: string,
  teacherId: string,
  updatedBy: string,
  scheduleId: string,
  classId: string,
  status: AbsentStasuses,
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
  classId: string,
  schedule: any
}

export type LogCountByClass = {
  classId?: string,
  className?: string,
  counts: LogCountBySchedule[];
}