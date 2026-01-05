import { StyleSheet } from "react-native";
import { colors } from "./colors";
// Shared styles for auth screens (login and signup)
export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    borderRadius: 10,
    padding: 20,
    maxWidth: 500,
    width: "100%",
    flex: 1,
    marginHorizontal: "auto",
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputError: {
    borderColor: colors.error,
  },

  // Navigation links
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  linkText: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  link: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default authStyles;
