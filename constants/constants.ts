export const SCHEDULE_START_DATE_MS = 259200000;

const now = new Date();
const nowScheduleDate = new Date();
nowScheduleDate.setDate(now.getDay() + 4);
nowScheduleDate.setFullYear(1970);
nowScheduleDate.setMonth(0);

export { nowScheduleDate };

export const DAY_NUMBERS = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
}
export const DAYS_ARRAY = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
]

export enum AbsentStasuses {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export enum ScheduleStasuses {
  OPENED = "OPENED",
  CLOSED = "CLOSED",
}

export enum ScheduleOpenMethods {
  QR_CODE = "QR_CODE",
  CALLOUT = "CALLOUT",
  GEOLOCATION = "GEOLOCATION",
}

export enum ExcuseTypes {
  SICK = 'SICK',
  OTHER = 'OTHER',
}

export enum ExcuseStatuses {
  WAITING = 'WAITING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ProfileRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export const MAX_DISTACE = 1;