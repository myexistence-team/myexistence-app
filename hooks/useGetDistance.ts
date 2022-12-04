import { useContext, useEffect, useMemo } from "react"
import { LocationContext } from "../contexts"
import { getLocationDistance } from "../utils/utilFunctions";

export default function useGetDistance(locationToCompare?: {
  latitude: number,
  longitude: number
}) {
  const { location, startForegroundLocation } = useContext(LocationContext);
  useEffect(() => {
    startForegroundLocation();
  }, [])
  const distance: number = useMemo(() => {
    if (locationToCompare && location) {
      return getLocationDistance(location, { 
        latitude: locationToCompare.latitude,
        longitude: locationToCompare.longitude,
      })
    } else {
      return 999;
    }
  }, [locationToCompare, location]);
  return distance;
}