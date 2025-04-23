import { AxiosError } from "axios";

export const throwRequestError = (error: unknown) => {
  let message = "";
  let code = 500;
  let errors;

  if (error instanceof AxiosError) {
    code = error.response?.status || code;
    message = error.response?.data?.message || "Unknown server error.";

    if (code === 422) {
      errors = error.response?.data?.errors;
    }
  } else {
    message = (error as { message: string }).message;
  }

  throw createError({
    statusCode: code,
    statusMessage: message,
    data: { errors },
  });
};

export const formatLabel = (key: string) => {
  const abbreviations = ["vin", "crn"];

  if (abbreviations.includes(key.toLowerCase())) {
    return key.toUpperCase();
  }

  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
