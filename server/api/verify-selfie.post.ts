import axios from "axios";
import { throwRequestError } from "~/utils";

export default defineEventHandler(async (_event) => {
  try {
    const formData = await readMultipartFormData(_event);
    const newFormData = new FormData();

    if (formData && formData.length > 0) {
      formData.forEach((field) => {
        let value: string | Blob;

        if (field.name === "video" || field.name === "image") {
          value = new Blob([field.data], {
            type: field.type,
          });
        } else {
          value = Buffer.from(field.data).toString();
        }

        if (field.filename && value instanceof Blob) {
          newFormData.append(field.name ?? "", value, field.filename);
        } else {
          newFormData.append(field.name ?? "", value);
        }
      });
    }

    const { data } = await axios.post<{
      data: unknown;
      message: string;
    }>("/api/verify-selfie", newFormData, {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error: unknown) {
    throwRequestError(error);
  }
});
