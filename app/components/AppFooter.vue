<template>
  <UFooter
    :ui="{
      container: 'border-t border-default lg:py-8'
    }"
  >
    <template #left>
      <p class="text-sm text-dimmed">
        © {{ new Date().getFullYear() }} Knecht
      </p>
    </template>
  </UFooter>
</template>
