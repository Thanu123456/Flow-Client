/**
 * Pulls the human-readable message out of an API error. The server wraps errors as
 * { error: { code, message, details } } (some older endpoints use { message } or { error: "text" }).
 */
export const apiErrorMessage = (err: any, fallback = 'Something went wrong'): string => {
  const data = err?.response?.data;
  const e = data?.error;
  return (
    (typeof e === 'string' ? e : e?.message) ||
    e?.details ||
    data?.message ||
    // a bare axios "status code 409" message is less useful than the caller's fallback
    (err?.response ? undefined : err?.message) ||
    fallback
  );
};
