<template>
  <div class="flex flex-col items-center justify-center gap-8 h-dvh p-4">
    <h1 class="text-2xl font-semibold">Tencent e-KYC Test</h1>
    <UCard variant="subtle" class="w-full overflow-hidden">
      <p class="text-xl">ID Document OCR</p>
      <UButton
        trailing-icon="i-lucide-arrow-right"
        label="Test ID OCR"
        :to="{ name: 'id-ocr' }"
        class="mt-2"
      />
      <p class="text-xl mt-6">Selfie Verification</p>
      <UButton
        trailing-icon="i-lucide-arrow-right"
        label="Test selfie verification"
        color="secondary"
        :to="{ name: 'selfie-verification' }"
        class="mt-2"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
