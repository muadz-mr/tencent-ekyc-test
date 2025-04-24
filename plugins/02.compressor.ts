import Compressor from "compressorjs";

export default defineNuxtPlugin(() => {
  const compress = (uploadedFile: File) => {
    return new Promise<File | Blob>((resolve, reject) => {
      new Compressor(uploadedFile, {
        quality: 0.8,
        maxWidth: 3840,
        maxHeight: 2160,
        minHeight: 720,
        minWidth: 720,
        convertSize: 2000000,
        convertTypes: ["image/jpeg", "image/png"],
        success(result) {
          resolve(result);
          return;
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  return {
    provide: {
      compressor: {
        compress,
      },
    },
  };
});
