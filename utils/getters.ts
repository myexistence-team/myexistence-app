export function getCurrentScheduleTime() {
  const nowScheduleDate = new Date();
  const now = new Date();
  nowScheduleDate.setDate(now.getDay() + 4);
  nowScheduleDate.setFullYear(1970);
  nowScheduleDate.setMonth(0);
  return nowScheduleDate;
}