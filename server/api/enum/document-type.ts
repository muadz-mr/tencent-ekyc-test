import axios from "axios";
import { throwRequestError } from "~/utils";

export default defineEventHandler(async (_event) => {
  try {
    const { data } = await axios.get<{
      data: unknown;
      message: string;
    }>("/api/enum/document-type", {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      headers: {
        Accept: "application/json",
      },
    });

    return data;
  } catch (error: unknown) {
    throwRequestError(error);
  }
});
