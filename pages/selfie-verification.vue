<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold">Selfie Verification</h1>

    <UCard variant="subtle" class="mt-4">
      <h2 class="text-sm font-semibold">
        1. Please capture your ID image first.
      </h2>
      <!-- eslint-disable vue/html-self-closing -->
      <input
        ref="idInputField"
        class="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        @change="handleFileChange"
      />

      <UButton
        variant="solid"
        color="neutral"
        label="Capture ID"
        :disabled="isLoading || isRecording"
        class="flex mt-4"
        @click="captureId"
      />

      <img ref="imagePreview" class="hidden w-full max-w-96 mt-6" />
    </UCard>

    <UCard v-show="formModel.image" variant="subtle" class="mt-4">
      <!-- Video recording -->
      <h2 class="text-sm font-semibold">
        2. Next, please record your selfie video.
      </h2>

      <section class="mt-4">
        <video
          id="videoPreview"
          ref="videoPreview"
          class="w-full max-w-80"
          :class="{ hidden: !formModel.image }"
          autoplay
          muted
          playsinline
        ></video>

        <div
          class="mt-4 relative h-1.5 rounded-xs bg-gray-200 dark:bg-gray-700 max-w-80"
          :class="{ hidden: !formModel.image }"
        >
          <div
            id="progress"
            ref="progress"
            class="h-full w-0 bg-[rgb(75,207,80)]"
          ></div>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <UButton
            id="startBtn"
            color="neutral"
            loading-icon="i-lucide-loader"
            :loading="isRecording"
            :disabled="isRecording || isLoading"
            @click="startRecording"
            >Start recording</UButton
          >
          <UButton
            id="stopBtn"
            color="error"
            :disabled="!isRecording || isLoading"
            @click="() => stopRecording()"
            >Stop</UButton
          >
        </div>
      </section>

      <section v-show="formModel.video" class="mt-4">
        <p class="text-sm">Recorded Video</p>
        <video
          ref="recordedVideoPreview"
          class="w-full max-w-80 mt-4"
          :class="{ hidden: !formModel.video }"
          controls
          playsinline
        ></video>
      </section>
    </UCard>

    <div>Video size: {{ formModel.video?.size }}</div>
    <div>Video type: {{ formModel.video?.type }}</div>

    <UButton
      v-if="formModel.image && formModel.video"
      label="Verify selfie"
      color="secondary"
      trailing-icon="i-lucide-arrow-right"
      class="flex mt-4"
      :loading="isLoading"
      :disabled="isLoading"
      @click="verifySelfie"
    />

    <template v-if="verifySelfieData">
      <USeparator label="Result" class="mt-8"></USeparator>
      <UCard variant="subtle" class="mt-4">
        <div
          v-for="resultItem in Object.entries(verifySelfieData).filter(
            (item) => item[0] !== 'best_frame_base64'
          )"
          :key="resultItem[0]"
          class="mt-2"
        >
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-400">
            {{ formatLabel(resultItem[0]) }}
          </p>
          <p class="text-sm">{{ resultItem[1] }}</p>
        </div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-400 mt-2">
          Best Frame from Video
        </p>
        <img
          :src="`data:image/jpeg;base64,${verifySelfieData.best_frame_base64}`"
          class="w-full max-w-96 mt-1"
        />
      </UCard>
    </template>

    <UButton
      label="Back to home"
      class="inline-flex mt-4"
      color="neutral"
      variant="ghost"
      leading-icon="i-lucide-arrow-left"
      :to="{ name: 'index' }"
      :disabled="isLoading || isRecording"
    />
  </div>
</template>

<script setup lang="ts">
import type { TApiResponse, TVerifySelfieData } from "~/types";

const toast = useToast();
const idInputField = ref<HTMLInputElement | null>(null);
const imagePreview = ref<HTMLImageElement | null>(null);
const videoPreview = ref<HTMLVideoElement | null>(null);
const recordedVideoPreview = ref<HTMLVideoElement | null>(null);
const progress = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const isRecording = ref(false);

// const mediaRecorder = ref<MediaRecorder | null>(null);
// const recordedChunks = ref<Blob[]>([]);
// const currentStream = ref<MediaStream | null>(null);
let mediaRecorder: MediaRecorder | undefined;
let recordedChunks: Blob[] = [];
let currentStream: MediaStream | undefined;
let progressInterval: string | number | NodeJS.Timeout | undefined;
let stopTimeout: string | number | NodeJS.Timeout | undefined;
let videoFile: File | undefined;

const formModel = ref<{
  image: File | null;
  video: File | null;
}>({
  image: null,
  video: null,
});

onUnmounted(() => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }
});

const initCamera = async () => {
  // Stop any existing stream
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: 640,
        height: 480,
      },
      audio: false,
    });
    videoPreview.value!.srcObject = currentStream;

    mediaRecorder = new MediaRecorder(currentStream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      videoFile = new File(recordedChunks, "selfieVideo.mp4", {
        type: "video/mp4",
      });
      const url = URL.createObjectURL(videoFile);
      recordedVideoPreview.value!.src = url;
      formModel.value.video = videoFile;
    };
  } catch (error: unknown) {
    toast.add({
      title: "Error",
      description: (error as MediaError).message || getErrorMessage(error),
      color: "error",
    });
  }
};

const resetProgress = () => {
  clearInterval(progressInterval);
  progress.value!.style.width = "0%";
};

const startRecording = () => {
  if (!mediaRecorder || mediaRecorder.state !== "inactive") return;

  const duration = 3;
  recordedChunks = [];

  mediaRecorder.start();
  isRecording.value = true;

  let elapsed = 0;
  progressInterval = setInterval(() => {
    elapsed++;
    const percent = Math.min((elapsed / duration) * 100, 100);
    progress.value!.style.width = percent + "%";
  }, 1000);

  stopTimeout = setTimeout(() => stopRecording(), duration * 1000);
};

const stopRecording = (manual = false) => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    isRecording.value = false;
    clearTimeout(stopTimeout);
    resetProgress();
    if (manual) progress.value!.style.width = "100%";
  }
};

const preparedFormData = () => {
  const formData = new FormData();
  formData.append("image", formModel.value.image as File);
  formData.append("video", formModel.value.video as File);
  return formData;
};

const verifySelfieData = ref<TVerifySelfieData | undefined>();

const verifySelfie = async () => {
  try {
    isLoading.value = true;
    const response = await $fetch<TApiResponse<TVerifySelfieData>>(
      "/api/verify-selfie",
      {
        method: "POST",
        body: preparedFormData(),
      }
    );

    verifySelfieData.value = response.data;
  } catch (error: unknown) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error) || "Error verifying your selfie.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const captureId = async () => {
  isLoading.value = true;
  idInputField.value!.click();
  isLoading.value = false;
};

const idPreviewImage = ref<string | ArrayBuffer | null>();

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  const fileReader = new FileReader();

  if (!file) {
    return;
  }

  try {
    const processedfile = await useNuxtApp().$compressor.compress(file);

    fileReader.readAsDataURL(processedfile);
    fileReader.addEventListener("load", () => {
      idPreviewImage.value = fileReader.result;
      const image = new File([processedfile], file.name, {
        type: processedfile.type,
      });

      imagePreview.value!.classList.remove("hidden");
      imagePreview.value!.src = idPreviewImage.value as string;
      formModel.value.image = image;
    });

    await initCamera();
  } catch (error: unknown) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error) || "Error compressing image.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped></style>
