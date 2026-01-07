export const getApiUrl = (): string => {
  if (__DEV__) {
    const addr = process.env.EXPO_PUBLIC_DEV_API_URL || "localhost";
    return "http://" + addr + ":3005";
  } else {
    return "https://worldalliance.org/api";
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
