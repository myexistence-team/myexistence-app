import { useEffect, useState } from "react";

export default function useCurrentScheduleTime() {
  const now = new Date();
  const nowScheduleDate = new Date();
  nowScheduleDate.setDate(now.getDay() + 4);
  nowScheduleDate.setFullYear(1970);
  nowScheduleDate.setMonth(0);
  const [time, setTime] = useState(nowScheduleDate);

  useEffect(() => {
    setInterval(() => {
      setTime((prev) => {
        prev.setSeconds(prev.getSeconds() + 1)
        return prev;
      });
    }, 1000)
  }, [])

  return time;
}