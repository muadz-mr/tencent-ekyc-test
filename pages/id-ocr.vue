<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold">ID OCR</h1>

    <UCard variant="subtle" class="mt-4">
      <USelect
        v-model="formModel.document_type"
        :items="documentTypes"
        placeholder="Select document type"
        class="w-48"
        variant="subtle"
        :loading="isFetching"
        :disabled="isFetching || isLoading"
        required
      />
      <!-- eslint-disable vue/html-self-closing -->
      <input
        ref="idInputField"
        class="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        @change="handleFileChange"
      />

      <UAlert
        v-if="!formModel.document_type"
        color="info"
        variant="subtle"
        title="Attention!"
        description="You need to select document type first before capturing your ID image."
        class="mt-4"
      />

      <UButton
        variant="solid"
        color="neutral"
        label="Capture ID"
        :disabled="isLoading || !formModel.document_type"
        class="flex mt-4"
        @click="captureId"
      />

      <img ref="imagePreview" class="hidden w-full max-w-96 mt-8" />
    </UCard>

    <UButton
      v-if="idPreviewImage && formModel.image"
      label="Analyse"
      trailing-icon="i-lucide-arrow-right"
      class="flex mt-4"
      :loading="isLoading"
      :disabled="isLoading"
      @click="analyse"
    />

    <template v-if="idData">
      <USeparator label="Result" class="mt-8"></USeparator>
      <UCard variant="subtle" class="mt-4">
        <div
          v-for="resultItem in Object.entries(idData).filter(
            (item) => item[0] !== 'head_portrait'
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
          Head Portrait
        </p>
        <img
          :src="`data:image/jpeg;base64,${idData.head_portrait}`"
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
    />
  </div>
</template>

<script setup lang="ts">
import type { TApiResponse, TEnum, TIdData } from "~/types";

const toast = useToast();
const idInputField = ref<HTMLInputElement | null>(null);
const imagePreview = ref<HTMLImageElement | null>(null);
const isFetching = ref(false);
const isLoading = ref(false);
const documentTypes = ref<{ label: string; value: string }[]>([]);
const formModel = ref<{
  document_type: string | undefined;
  image: File | null;
}>({
  document_type: "",
  image: null,
});

onMounted(async () => {
  await getDocumentTypes();

  // if (getDocumentTypesError.value) {
  //   console.error(getDocumentTypesError.value);
  // }

  // if (documentTypesData.value) {
  //   documentTypes.value = documentTypesData.value;
  // documentTypes.value = documentTypesData.value.data.map((item: any) => {
  //   return { value: item.value, label: item.description };
  // });
  // }
});

const getDocumentTypes = async () => {
  try {
    isFetching.value = true;
    const response = await $fetch<TApiResponse<TEnum[]>>(
      "/api/enum/document-type"
    );

    documentTypes.value = response?.data.map((item: TEnum) => {
      return { value: item.value.toString(), label: item.description };
    });
  } catch (error: unknown) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error) || "Error fetching document types.",
      color: "error",
    });
  } finally {
    isFetching.value = false;
  }
};

// const {
//   data: documentTypesData,
//   error: getDocumentTypesError,
//   execute: getDocumentTypes,
//   status,
// } = useFetch("/api/enum/document-type", {
//   key: "enum-doc-types",
//   lazy: true,
//   method: "GET",
//   transform: (data: { data: { value: number; description: string }[] }) => {
//     return data?.data.map((type: { value: number; description: string }) => ({
//       label: type.description,
//       value: type.value.toString(),
//     }));
//   },
// });

const preparedFormData = () => {
  const formData = new FormData();
  formData.append("document_type", formModel.value.document_type as string);
  formData.append("image", formModel.value.image as File);
  return formData;
};

const idData = ref<TIdData | undefined>();

const analyse = async () => {
  try {
    isLoading.value = true;
    const response = await $fetch<TApiResponse<TIdData>>("/api/analyse-id", {
      method: "POST",
      body: preparedFormData(),
    });

    idData.value = response.data;
  } catch (error: unknown) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error) || "Error validating your ID.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const captureId = () => {
  if (!formModel.value.document_type) return;
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
