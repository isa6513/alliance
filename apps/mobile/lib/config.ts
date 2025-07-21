import { prod_api_url } from "@alliance/shared/lib/config";
import localhost from "react-native-localhost";

export const getApiUrl = (): string => {
  const addr = "10.103.2.116";
  if (__DEV__) {
    return "http://" + addr + ":3005";
  } else {
    return prod_api_url;
  }
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};
