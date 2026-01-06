export const getApiUrl = (): string => {
  const addr = "192.168.4.26";
  if (__DEV__) {
    return "http://" + addr + ":3005";
  } else {
    return "https://worldalliance.org/api";
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
