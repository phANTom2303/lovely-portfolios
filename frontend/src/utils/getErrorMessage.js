export function getErrorMessage(error, fallback = "Something went wrong.") {
  const responseData = error?.response?.data;
  const messages = responseData?.errors;

  if (Array.isArray(messages)) {
    return messages
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join(" ") || fallback;
  }

  if (messages && typeof messages === "object") {
    const values = Object.values(messages).flat();
    if (values.length > 0) return values.join(" ");
  }

  if (typeof responseData === "string") return responseData;
  return responseData?.message || responseData?.error || error?.message || fallback;
}