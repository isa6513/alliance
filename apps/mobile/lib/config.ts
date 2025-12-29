export const getApiUrl = (): string => {
  const addr = "localhost";
  if (__DEV__) {
    return "http://" + addr + ":3005";
  } else {
    return "https://worldalliance.org/api";
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
