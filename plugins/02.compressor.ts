import Compressor from "compressorjs";

export default defineNuxtPlugin(() => {
  const compress = (uploadedFile: File) => {
    return new Promise((resolve, reject) => {
      new Compressor(uploadedFile, {
        quality: 0.8,
        convertSize: 2400000,
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
