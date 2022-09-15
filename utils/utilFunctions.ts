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