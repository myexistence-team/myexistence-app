import Colors from "../constants/Colors";

export function groupBy(xs: any[], key: string): {[key: string]: any[]} {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export async function getBlob(uri: string) {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // on load
    xhr.onload = function () {
      resolve(xhr.response);
    };
    // on error
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    // on complete
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "PRESENT":
      return Colors.light.green;
    case "ABSENT":
      return Colors.light.red;
    case "LATE":
      return Colors.light.orange;
    case "EXCUSED":
      return Colors.light.yellows.yellow3;
    default:
      return Colors.light.black;
  }
}

export function getLocationDistance(
  { latitude: latitudeA, longitude: longitudeA }: { latitude: number, longitude: number },
  { latitude: latitudeB, longitude: longitudeB }: { latitude: number, longitude: number },
) {
  const a = latitudeA - latitudeB;
  const b = latitudeA - latitudeB;
  return Math.sqrt(a*a + b*b);
}

export const getDays = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

export function getStartOfWeek() {
  const firstDayOfWeek = new Date();
  const todayDate = firstDayOfWeek.getDate();
  const todayInt = firstDayOfWeek.getDay();
  var lastWeekDate = todayDate - todayInt;
  if (lastWeekDate < 1) {
    lastWeekDate += getDays(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth());
    var prevMonth = firstDayOfWeek.getMonth() - 1;
    if (prevMonth < 0) prevMonth = 12;
    firstDayOfWeek.setMonth(prevMonth);
  }
  firstDayOfWeek.setHours(0);
  firstDayOfWeek.setMinutes(0);
  firstDayOfWeek.setSeconds(0);
  firstDayOfWeek.setDate(lastWeekDate);
  return firstDayOfWeek;
}

export function getStartOfMonth() {
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  return firstOfMonth;
}

export function getStartOfYear() {
  const firstOfYear = new Date();
  firstOfYear.setDate(1);
  firstOfYear.setMonth(0)
  return firstOfYear;
}

export function percentage(partialValue: number, totalValue: number, isRounded?: boolean) {
  return Math.floor((100 * partialValue) / totalValue);
} 