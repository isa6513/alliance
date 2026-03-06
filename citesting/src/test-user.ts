import process from "process";

export const DEFAULT_TEST_USER_EMAIL = "user15@example.com";
export const DEFAULT_TEST_USER_PASSWORD = "Steadying3-Sacrament-Crave";

export const testUserEmail =
  process.env.TEST_USER_EMAIL ?? DEFAULT_TEST_USER_EMAIL;
export const testUserPassword =
  process.env.TEST_USER_PASSWORD ?? DEFAULT_TEST_USER_PASSWORD;
