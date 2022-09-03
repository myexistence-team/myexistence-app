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