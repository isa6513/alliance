import { prod_api_url } from "@alliance/shared/lib/config";

export const getApiUrl = (): string => {
  const addr = "192.168.5.27";
  if (__DEV__) {
    return "http://" + addr + ":3005";
  } else {
    return prod_api_url;
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
