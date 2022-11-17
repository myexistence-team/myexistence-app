import Colors from "../constants/Colors";

export const groupBy = function(xs: any[], key: string) {
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