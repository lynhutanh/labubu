export function isUrl(url: string): boolean {
  const regex =
    /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(url);
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildUrl(baseUrl: string, params?: { [key: string]: any }) {
  if (!params) {
    return baseUrl;
  }

  const queryString = Object.keys(params)
    .map((k) => {
      if (Array.isArray(params[k])) {
        return params[k]
          .map((param) => `${encodeURI(k)}=${encodeURI(param)}`)
          .join("&");
      }
      return `${encodeURI(k)}=${encodeURI(params[k])}`;
    })
    .join("&");
  return `${baseUrl}?${queryString}`;
}
