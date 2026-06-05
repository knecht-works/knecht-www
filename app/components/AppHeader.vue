<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-6 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UButton
        label="Get notified"
        color="neutral"
        class="hidden lg:flex"
        to="#"
      />
    </template>

    <template #body>
      <UButton
        label="Get notified"
        block
        to="#"
      />
    </template>
  </UHeader>
</template>
