export function errorMessage(params: {
  error: unknown;
  fallback: string;
}): string {
  const { error, fallback } = params;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
    // NestJS validation errors put an array of messages in `message`.
    if (Array.isArray(message)) {
      const joined = message.filter((m) => typeof m === "string").join(", ");
      if (joined.length > 0) return joined;
    }
  }
  return fallback;
}
