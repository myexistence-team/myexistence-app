import { useEffect, useState } from "react";

export default function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000)
  }, [])

  return time;
}