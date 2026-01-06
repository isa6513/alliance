import { local_ip } from "../local-ip";

export const getApiUrl = (): string => {
  if (__DEV__) {
    const addr = local_ip || "localhost";
    return "http://" + addr + ":3005";
  } else {
    return "https://worldalliance.org/api";
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
