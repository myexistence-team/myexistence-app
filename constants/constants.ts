export const SCHEDULE_START_DATE_MS = 259200000;

const now = new Date();
const nowSchedule = new Date();
nowSchedule.setDate(now.getDay() + 4);
nowSchedule.setFullYear(1970);
nowSchedule.setMonth(0);

export { nowSchedule };

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