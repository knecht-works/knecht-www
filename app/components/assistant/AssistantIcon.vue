<script setup lang="ts">
withDefaults(defineProps<{ mood?: AssistantMood }>(), { mood: 'idle' })
</script>

<template>
  <AppLogoMark
    class="assistant-icon"
    :class="`assistant-icon--${mood}`"
  />
</template>

<style scoped>
.assistant-icon {
  transform-box: fill-box;
  transform-origin: center;
}

.assistant-icon--idle { animation: assistant-float 3.2s ease-in-out infinite; }
.assistant-icon--happy { animation: assistant-happy 2.5s ease-in-out infinite; }
.assistant-icon--thinking { animation: assistant-thinking 1.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .assistant-icon { animation: none; }
}

@keyframes assistant-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes assistant-happy {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-2px) rotate(2deg); }
  66% { transform: translateY(-1px) rotate(-1.5deg); }
}

@keyframes assistant-thinking {
  0%, 100% { transform: rotate(-6deg) translateY(0); }
  30% { transform: rotate(4deg) translateY(-2px); }
  60% { transform: rotate(-8deg) translateY(-1px); }
}
</style>
